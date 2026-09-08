/**
 * OrdersModal - Active Orders Display Modal
 * 
 * This component displays the list of active orders for the current table session.
 * Shows order status, items, and allows tracking order progress.
 */

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

// Order status types based on actual backend enum
export type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
    menuItemName: string;
    quantity: number;
    price: number;
    note: string | null;
}

export interface Order {
    id: number;
    status: OrderStatus;
    totalAmount: number;
    createdAt: string;
    generalNote: string | null;
    canCancel: boolean;
    cancellationReason: string | null;
    items: OrderItem[];
}

export interface OrdersModalProps {
    modalId: string;
    qrToken: string;
    onRefresh?: () => void;
}

const ORDERS_POLL_INTERVAL_MS = 20_000;

type FetchMode = 'initial' | 'manual' | 'background';

function areOrdersEqual(currentOrders: Order[], nextOrders: Order[]): boolean {
    return JSON.stringify(currentOrders) === JSON.stringify(nextOrders);
}

// Status configuration for display
const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    RECEIVED: {
        label: 'Sipariş Alındı',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    PREPARING: {
        label: 'Hazırlanıyor',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    READY: {
        label: 'Hazır',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        )
    },
    SERVED: {
        label: 'Servis Edildi',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        )
    },
    COMPLETED: {
        label: 'Tamamlandı',
        color: 'text-gray-600',
        bgColor: 'bg-gray-200',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    CANCELLED: {
        label: 'İptal Edildi',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        )
    }
};

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export default function OrdersModal({
    modalId,
    qrToken,
    onRefresh,
    theme = 'DEFAULT'
}: OrdersModalProps & { theme?: 'DEFAULT' | 'MODERN' | 'ELEGANT' }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
    const [isRequestingBill, setIsRequestingBill] = useState(false);
    const [billRequested, setBillRequested] = useState(false);
    const ordersRef = useRef<Order[]>([]);
    const hasSuccessfulFetchRef = useRef(false);
    const activeRequestRef = useRef<AbortController | null>(null);

    // Theme Configuration
    const themeStyles = {
        DEFAULT: {
            bg: "bg-white",
            text: "text-gray-900",
            textSecondary: "text-gray-600",
            textMuted: "text-gray-400",
            border: "border-gray-200",
            cardBg: "bg-gray-50",
            cardText: "text-gray-900",
            iconColor: "text-gray-600",
            buttonClose: "text-secondary-700 border-secondary-700 hover:bg-secondary-700 hover:text-white"
        },
        MODERN: {
            bg: "bg-[#1f1f1f]",
            text: "text-white",
            textSecondary: "text-gray-300",
            textMuted: "text-gray-500",
            border: "border-gray-700",
            cardBg: "bg-[#2d2d2d]",
            cardText: "text-gray-100",
            iconColor: "text-gray-400",
            buttonClose: "text-[#ea580c] border-[#ea580c] hover:bg-[#ea580c] hover:text-white"
        },
        ELEGANT: {
            bg: "bg-[#f5f5dc]",
            text: "text-[#5c4033]",
            textSecondary: "text-[#8b4513]",
            textMuted: "text-[#8b4513]/60",
            border: "border-[#d2b48c]",
            cardBg: "bg-[#fdfbf7] border border-[#e6dcc3]",
            cardText: "text-[#5c4033]",
            iconColor: "text-[#8b4513]",
            buttonClose: "text-[#8b4513] border-[#8b4513] hover:bg-[#8b4513] hover:text-[#fdfbf7]"
        }
    };

    const styles = themeStyles[theme] || themeStyles.DEFAULT;

    const fetchOrders = useCallback(async (mode: FetchMode = 'manual') => {
        // Polling never interrupts an already-running user-triggered request.
        if (mode === 'background' && activeRequestRef.current) {
            return;
        }

        activeRequestRef.current?.abort();
        const controller = new AbortController();
        activeRequestRef.current = controller;

        if (mode === 'initial') {
            setIsInitialLoading(true);
        } else if (mode === 'manual') {
            setIsRefreshing(true);
        }

        if (mode !== 'background') {
            setError(null);
        }

        try {
            const response = await fetch(`/api/public/table/order?qrToken=${encodeURIComponent(qrToken)}`, {
                cache: 'no-store',
                signal: controller.signal
            });
            const data = await response.json();

            if (response.ok) {
                const nextOrders = data as Order[];
                hasSuccessfulFetchRef.current = true;

                if (!areOrdersEqual(ordersRef.current, nextOrders)) {
                    ordersRef.current = nextOrders;
                    setOrders(nextOrders);
                }

                // A successful background request also clears a previous visible error.
                setError(null);
            } else {
                // Keep the last successful data visible when a background poll fails.
                if (mode !== 'background' || !hasSuccessfulFetchRef.current) {
                    setError(data.error || 'Siparişler yüklenirken bir hata oluştu');
                }
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }

            if (mode !== 'background' || !hasSuccessfulFetchRef.current) {
                setError('Siparişler yüklenirken bir hata oluştu');
            }
        } finally {
            if (activeRequestRef.current === controller) {
                activeRequestRef.current = null;
                setIsInitialLoading(false);
                setIsRefreshing(false);
            }
        }
    }, [qrToken]);

    // Fetch immediately, then refresh silently every 20 seconds.
    useEffect(() => {
        void fetchOrders('initial');

        const intervalId = window.setInterval(() => {
            void fetchOrders('background');
        }, ORDERS_POLL_INTERVAL_MS);

        return () => {
            window.clearInterval(intervalId);
            activeRequestRef.current?.abort();
            activeRequestRef.current = null;
        };
    }, [fetchOrders]);

    const handleRefresh = () => {
        void fetchOrders('manual');
        onRefresh?.();
    };

    const handleCancelOrder = async (orderId: number) => {
        setCancellingOrderId(orderId);

        try {
            const response = await fetch(`/api/public/table/order/${orderId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrToken })
            });

            const data = await response.json();

            if (response.ok) {
                // Refresh orders to show updated status
                await fetchOrders('manual');
            } else {
                // Show error
                setError(data.error || 'İptal işlemi başarısız oldu');
            }
        } catch (err) {
            setError('Sipariş iptal edilirken bir hata oluştu');
        } finally {
            setCancellingOrderId(null);
        }
    };

    const handleRequestBill = async () => {
        setIsRequestingBill(true);

        try {
            const response = await fetch('/api/public/table/request-bill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrToken })
            });

            const data = await response.json();

            if (response.ok) {
                setBillRequested(true);
            } else {
                setError(data.error || 'Hesap isteği gönderilemedi');
            }
        } catch (err) {
            setError('Hesap isteği gönderilirken bir hata oluştu');
        } finally {
            setIsRequestingBill(false);
        }
    };

    const grandTotal = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const hasActiveOrder = orders.some((order) => order.status !== 'SERVED' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED');

    return (
        <dialog id={modalId} className="modal modal-bottom">
            <div className={`modal-box w-full max-w-md h-[70vh] max-h-[70vh] flex flex-col p-0 rounded-t-3xl rounded-b-none m-0 mx-auto ${styles.bg}`}>
                {/* Header */}
                <div className={`p-6 pb-4 border-b flex justify-between items-center shrink-0 ${styles.border}`}>
                    <h2 className={`text-2xl font-bold ${styles.text}`}>Siparişlerim</h2>
                    <div className="flex items-center gap-2">
                        <form method="dialog">
                            <button className={`btn btn-ghost btn-sm btn-circle ${styles.buttonClose}`}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isInitialLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <span className="loading loading-spinner loading-lg text-pink-500"></span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="text-red-500 mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 mx-auto"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <p className={styles.textSecondary}>{error}</p>
                            <button
                                onClick={handleRefresh}
                                className="btn btn-sm btn-outline mt-4"
                            >
                                Tekrar Dene
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className={`${theme === 'MODERN' ? 'text-gray-700' : 'text-gray-300'} mb-4`}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 mx-auto"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <p className={`${styles.textMuted} text-lg`}>Henüz sipariş yok</p>
                            <p className={`${styles.textMuted} text-sm mt-1`}>Menüden ürün ekleyerek sipariş verebilirsiniz</p>
                        </div>
                    ) : (
                        <>
                            {orders.map((order) => {
                                const status = statusConfig[order.status] || statusConfig.RECEIVED;

                                return (
                                    <div
                                        key={order.id}
                                        className={`${styles.cardBg} rounded-xl p-4 space-y-3`}
                                    >
                                        {/* Order Header */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className={`text-sm ${styles.textSecondary}`}>Sipariş #{order.id}</span>
                                                <p className={`text-xs ${styles.textMuted} mt-0.5`}>
                                                    {formatDateTime(order.createdAt)}
                                                </p>
                                            </div>
                                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${status.bgColor} ${status.color}`}>
                                                {status.icon}
                                                <span className="text-xs font-medium">{status.label}</span>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-2">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-medium ${styles.cardText} text-sm`}>
                                                                {item.quantity}x
                                                            </span>
                                                            <span className={`${styles.textSecondary} text-sm`}>{item.menuItemName}</span>
                                                        </div>
                                                        {item.note && (
                                                            <p className={`text-xs ${styles.textMuted} mt-0.5 ml-6`}>
                                                                Not: {item.note}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className={`text-sm font-medium ${styles.cardText}`}>
                                                        {(item.price * item.quantity).toFixed(2)} TL
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* General Note */}
                                        {order.generalNote && (
                                            <div className="bg-blue-50/10 rounded-lg p-2 border border-blue-100/20">
                                                <p className="text-xs text-blue-500">
                                                    <span className="font-medium">Sipariş Notu:</span> {order.generalNote}
                                                </p>
                                            </div>
                                        )}

                                        {/* Order Total */}
                                        <div className={`border-t ${theme === 'MODERN' ? 'border-gray-600' : 'border-gray-200'} pt-2 flex justify-between items-center`}>
                                            <span className={`text-sm font-medium ${styles.textSecondary}`}>Sipariş Tutarı</span>
                                            <span className={`font-bold ${styles.text}`}>{order.totalAmount.toFixed(2)} TL</span>
                                        </div>

                                        {/* Cancellation Reason */}
                                        {order.status === 'CANCELLED' && order.cancellationReason && (
                                            <div className="bg-red-50/10 rounded-lg p-2 border border-red-100/20">
                                                <p className="text-xs text-red-500">
                                                    <span className="font-medium">İptal Sebebi:</span> {order.cancellationReason}
                                                </p>
                                            </div>
                                        )}

                                        {/* Cancel Button - subtle link style */}
                                        {order.canCancel && order.status !== 'CANCELLED' && (
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                disabled={cancellingOrderId === order.id}
                                                className="text-xs text-red-400 mt-2 flex items-center gap-1 active:opacity-70"
                                            >
                                                {cancellingOrderId === order.id ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        İptal et
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {/* Show why order cannot be cancelled */}
                                        {!order.canCancel && order.status !== 'CANCELLED' && order.cancellationReason && (
                                            <p className={`text-xs ${styles.textMuted} mt-2 flex items-center gap-1`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {order.cancellationReason}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Footer - Grand Total and Request Bill */}
                {orders.length > 0 && (
                    <div className={`p-6 pt-4 border-t ${styles.border} shrink-0 space-y-3`}>
                        <div className="flex justify-between items-center">
                            <span className={`${styles.textSecondary} font-medium`}>Toplam Tutar</span>
                            <span className={`text-2xl font-bold ${styles.text}`}>
                                {grandTotal.toFixed(2)} TL
                            </span>
                        </div>

                        {/* Request Bill Button */}
                        {billRequested ? (
                            <div className="flex items-center justify-center gap-2 py-3 bg-green-50 rounded-xl text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-medium">Hesap isteği gönderildi</span>
                            </div>
                        ) : hasActiveOrder ? (
                            <div className="flex items-center gap-2 py-3 px-4 bg-amber-50 rounded-xl text-amber-700 border border-amber-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-sm font-medium">Hesap isteyebilmek için tüm siparişlerin servis edilmiş olması gerekir.</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleRequestBill}
                                disabled={isRequestingBill}
                                className="btn w-full bg-green-500 active:bg-green-600 text-white border-none"
                            >
                                {isRequestingBill ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                        Hesap İste
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
}
