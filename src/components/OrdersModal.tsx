/**
 * OrdersModal - Active Orders Display Modal
 * 
 * This component displays the list of active orders for the current table session.
 * Shows order status, items, and allows tracking order progress.
 */

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Order status types based on actual backend enum
export type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
type MenuTheme = 'DEFAULT' | 'MODERN' | 'ELEGANT';

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
const SERVED_CELEBRATION_DURATION_MS = 5_500;

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

const celebrationParticles = [
    { left: '8%', top: '16%', delay: 0.05, rotate: 24 },
    { left: '18%', top: '72%', delay: 0.18, rotate: -32 },
    { left: '31%', top: '10%', delay: 0.3, rotate: 58 },
    { left: '69%', top: '12%', delay: 0.12, rotate: -18 },
    { left: '82%', top: '69%', delay: 0.24, rotate: 45 },
    { left: '92%', top: '25%', delay: 0.36, rotate: -48 },
];

const celebrationThemeStyles = {
    DEFAULT: {
        background: "bg-[radial-gradient(circle_at_50%_32%,#fff7ed_0%,#ffffff_48%,#fce7f3_100%)]",
        text: "text-gray-900",
        eyebrow: "text-pink-600",
        body: "text-gray-600",
        glowStart: "bg-orange-300/30",
        glowEnd: "bg-pink-300/25",
        steam: "bg-orange-400/55",
        plate: "border-orange-200 bg-white/85 shadow-[0_24px_80px_rgba(236,72,153,0.18)]",
        button: "border-pink-400 bg-pink-500 text-white active:bg-pink-600",
        progress: "bg-pink-500",
        particleColors: ['#EC4899', '#F8A45A', '#FDBA74', '#F9A8D4'],
        dishFill: '#F8A45A',
        dishStroke: '#DB2777',
        checkStroke: '#FFFFFF',
        font: ""
    },
    MODERN: {
        background: "bg-[radial-gradient(circle_at_50%_30%,#4a2819_0%,#1f1f1f_45%,#111111_100%)]",
        text: "text-white",
        eyebrow: "text-orange-400",
        body: "text-gray-300",
        glowStart: "bg-orange-500/25",
        glowEnd: "bg-red-600/15",
        steam: "bg-orange-300/60",
        plate: "border-orange-500/30 bg-[#2d2d2d]/90 shadow-[0_24px_80px_rgba(234,88,12,0.25)]",
        button: "border-orange-500 bg-[#ea580c] text-white active:bg-[#c2410c]",
        progress: "bg-[#ea580c]",
        particleColors: ['#EA580C', '#F8A45A', '#FB923C', '#FFFFFF'],
        dishFill: '#EA580C',
        dishStroke: '#F8A45A',
        checkStroke: '#FFFFFF',
        font: ""
    },
    ELEGANT: {
        background: "bg-[radial-gradient(circle_at_50%_30%,#fdfbf7_0%,#f5f5dc_52%,#e6dcc3_100%)]",
        text: "text-[#5c4033]",
        eyebrow: "text-[#8b4513]",
        body: "text-[#8b4513]/75",
        glowStart: "bg-[#d2b48c]/35",
        glowEnd: "bg-[#9C6644]/15",
        steam: "bg-[#8b4513]/40",
        plate: "border-[#d2b48c] bg-[#fdfbf7]/90 shadow-[0_24px_80px_rgba(92,64,51,0.16)]",
        button: "border-[#9C6644] bg-[#9C6644] text-[#fdfbf7] active:bg-[#7f5539]",
        progress: "bg-[#9C6644]",
        particleColors: ['#9C6644', '#D2B48C', '#8B4513', '#E6DCC3'],
        dishFill: '#D2B48C',
        dishStroke: '#8B4513',
        checkStroke: '#5C4033',
        font: "font-serif"
    }
} satisfies Record<MenuTheme, {
    background: string;
    text: string;
    eyebrow: string;
    body: string;
    glowStart: string;
    glowEnd: string;
    steam: string;
    plate: string;
    button: string;
    progress: string;
    particleColors: string[];
    dishFill: string;
    dishStroke: string;
    checkStroke: string;
    font: string;
}>;

function ServedCelebration({
    orderId,
    onDismiss,
    theme
}: {
    orderId: number;
    onDismiss: () => void;
    theme: MenuTheme;
}) {
    const prefersReducedMotion = useReducedMotion();
    const styles = celebrationThemeStyles[theme];

    return (
        <motion.div
            className={`fixed inset-0 flex min-h-[100dvh] items-center justify-center overflow-hidden px-6 py-10 ${styles.background} ${styles.text} ${styles.font}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.35 }}
        >
            <div className={`absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl ${styles.glowStart}`} />
            <div className={`absolute -bottom-28 -right-24 h-80 w-80 rounded-full blur-3xl ${styles.glowEnd}`} />

            {!prefersReducedMotion && celebrationParticles.map((particle, index) => (
                <motion.span
                    key={`${particle.left}-${particle.top}`}
                    className="absolute h-2.5 w-6 rounded-full"
                    style={{
                        left: particle.left,
                        top: particle.top,
                        backgroundColor: styles.particleColors[index % styles.particleColors.length]
                    }}
                    initial={{ opacity: 0, y: -30, rotate: 0, scale: 0.4 }}
                    animate={{ opacity: [0, 1, 1, 0], y: [-30, 0, 18, 58], rotate: particle.rotate + 180, scale: [0.4, 1, 1, 0.7] }}
                    transition={{ duration: 3.2, delay: particle.delay, repeat: Infinity, repeatDelay: 0.7, ease: 'easeOut' }}
                    aria-hidden="true"
                />
            ))}

            <motion.div
                className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 180, damping: 18, delay: prefersReducedMotion ? 0 : 0.12 }}
            >
                <div className="relative mb-8">
                    {!prefersReducedMotion && (
                        <div className="absolute -top-9 left-1/2 flex -translate-x-1/2 gap-3" aria-hidden="true">
                            {[0, 1, 2].map((steam) => (
                                <motion.span
                                    key={steam}
                                    className={`block h-9 w-1.5 rounded-full blur-[1px] ${styles.steam}`}
                                    initial={{ opacity: 0, y: 12, scaleY: 0.6 }}
                                    animate={{ opacity: [0, 0.75, 0], y: [12, -10, -24], x: [0, steam % 2 === 0 ? 5 : -5, 0], scaleY: [0.6, 1, 0.8] }}
                                    transition={{ duration: 2, delay: steam * 0.25, repeat: Infinity, ease: 'easeOut' }}
                                />
                            ))}
                        </div>
                    )}

                    <motion.div
                        className={`flex h-36 w-36 items-center justify-center rounded-full border backdrop-blur-md ${styles.plate}`}
                        animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <svg viewBox="0 0 120 120" className="h-24 w-24" fill="none" aria-hidden="true">
                            <path d="M22 73h76" stroke={styles.dishStroke} strokeWidth="6" strokeLinecap="round" />
                            <path d="M31 70c1-20 13-34 29-34s28 14 29 34H31Z" fill={styles.dishFill} stroke={styles.dishStroke} strokeWidth="4" strokeLinejoin="round" />
                            <path d="M53 31a7 7 0 0 1 14 0" stroke={styles.dishStroke} strokeWidth="5" strokeLinecap="round" />
                            <path d="m47 55 8 8 18-18" stroke={styles.checkStroke} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M17 83c15 7 71 7 86 0" stroke={styles.dishStroke} strokeWidth="5" strokeLinecap="round" />
                        </svg>
                    </motion.div>
                </div>

                <motion.p
                    className={`mb-3 text-xs font-bold uppercase tracking-[0.32em] ${styles.eyebrow}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 0.35 }}
                >
                    Sipariş #{orderId} servis edildi
                </motion.p>
                <h2 id="served-celebration-title" className="text-5xl font-black tracking-tight sm:text-6xl">
                    Afiyet olsun!
                </h2>
                <p className={`mt-4 max-w-xs text-base leading-relaxed ${styles.body}`}>
                    Siparişiniz masanızda. Keyifli bir yemek dileriz.
                </p>

                <button
                    type="button"
                    onClick={onDismiss}
                    className={`mt-9 min-h-12 rounded-full border px-8 py-3 text-sm font-bold shadow-lg transition-transform active:scale-95 ${styles.button}`}
                >
                    Teşekkürler
                </button>
            </motion.div>

            <motion.div
                className={`absolute bottom-0 left-0 h-1.5 ${styles.progress}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: SERVED_CELEBRATION_DURATION_MS / 1000, ease: 'linear' }}
                aria-hidden="true"
            />
        </motion.div>
    );
}

export default function OrdersModal({
    modalId,
    qrToken,
    onRefresh,
    theme = 'DEFAULT'
}: OrdersModalProps & { theme?: MenuTheme }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
    const [isRequestingBill, setIsRequestingBill] = useState(false);
    const [billRequested, setBillRequested] = useState(false);
    const [servedCelebrationOrderId, setServedCelebrationOrderId] = useState<number | null>(null);
    const ordersRef = useRef<Order[]>([]);
    const hasSuccessfulFetchRef = useRef(false);
    const activeRequestRef = useRef<AbortController | null>(null);
    const celebrationDialogRef = useRef<HTMLDialogElement>(null);

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
                const newlyServedOrder = hasSuccessfulFetchRef.current
                    ? nextOrders.find((nextOrder) => {
                        const previousOrder = ordersRef.current.find((order) => order.id === nextOrder.id);
                        return nextOrder.status === 'SERVED' && previousOrder !== undefined && previousOrder.status !== 'SERVED';
                    })
                    : undefined;

                hasSuccessfulFetchRef.current = true;

                if (!areOrdersEqual(ordersRef.current, nextOrders)) {
                    ordersRef.current = nextOrders;
                    setOrders(nextOrders);
                }

                if (newlyServedOrder) {
                    setServedCelebrationOrderId(newlyServedOrder.id);
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

    const dismissServedCelebration = useCallback(() => {
        celebrationDialogRef.current?.close();
        setServedCelebrationOrderId(null);
    }, []);

    useEffect(() => {
        if (servedCelebrationOrderId === null) {
            return;
        }

        const dialog = celebrationDialogRef.current;
        if (dialog && !dialog.open) {
            dialog.showModal();
        }

        const timeoutId = window.setTimeout(() => {
            dismissServedCelebration();
        }, SERVED_CELEBRATION_DURATION_MS);

        return () => window.clearTimeout(timeoutId);
    }, [dismissServedCelebration, servedCelebrationOrderId]);

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
        <>
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

                                        {/* Temporary animation test trigger */}
                                        <button
                                            type="button"
                                            onClick={() => setServedCelebrationOrderId(order.id)}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-amber-400/70 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-600 transition-colors hover:bg-amber-400/20 active:bg-amber-400/30"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 6h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
                                            </svg>
                                            Afiyet Olsun Animasyonunu Test Et
                                        </button>

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

        <dialog
            ref={celebrationDialogRef}
            aria-labelledby="served-celebration-title"
            onCancel={(event) => {
                event.preventDefault();
                dismissServedCelebration();
            }}
            onClose={() => setServedCelebrationOrderId(null)}
            className={`m-0 h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 outline-none ${
                theme === 'MODERN'
                    ? 'backdrop:bg-black/80'
                    : theme === 'ELEGANT'
                        ? 'backdrop:bg-[#5c4033]/30'
                        : 'backdrop:bg-white/70'
            }`}
        >
            <AnimatePresence>
                {servedCelebrationOrderId !== null && (
                    <ServedCelebration
                        key={servedCelebrationOrderId}
                        orderId={servedCelebrationOrderId}
                        onDismiss={dismissServedCelebration}
                        theme={theme}
                    />
                )}
            </AnimatePresence>
        </dialog>
        </>
    );
}
