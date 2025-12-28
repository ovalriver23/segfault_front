'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Table {
  id: string;
  name: string;
  capacity: number;
  qrToken: string;
  status: string;
}

interface OrderItem {
  menuItemName: string;
  quantity: number;
  price: number;
  note?: string | null;
}

interface Order {
  id: number;
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

const statusLabels: Record<string, string> = {
  PENDING: 'Onay Bekliyor',
  CONFIRMED: 'Hazırlanıyor',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
};

export default function WaiterTablesPage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const fetchOrders = async (qrToken: string) => {
    setIsLoadingOrders(true);
    try {
      const response = await fetch(`/api/public/table/order?qrToken=${qrToken}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Siparişler yüklenemedi:', err);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleInfoClick = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
    fetchOrders(table.qrToken);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
    setOrders([]);
  };

  const fetchTables = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/waiter/tables/get', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        const errorMsg = errorData.error || errorData.message || '';

        if (response.status === 403 && (
          errorMsg.includes("şifrenizi değiştirmeniz") ||
          errorMsg.includes("password")
        )) {
          router.push('/waiter/change-password?reason=forced');
          return;
        }

        throw new Error(errorMsg || 'Masalar yüklenemedi');
      }

      const data = await response.json();
      setTables(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Bağlantı hatası. Lütfen sayfayı yenileyin.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 30000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  // İstatistikleri hesapla
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.status !== 'EMPTY').length;
  const availableTables = totalTables - occupiedTables;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen pb-20">
        <span className="loading loading-spinner loading-lg text-[#E11383]"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen px-6 text-center pb-20">
        <p className="text-red-500 mb-4 font-medium">{error}</p>
        <button
          onClick={fetchTables}
          className="btn bg-[#E11383] text-white hover:bg-[#c00f6f] border-none"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-24 font-sans">
      {/* Header ve Yenileme Butonu */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-normal text-black" style={{ fontFamily: 'Pontano Sans, sans-serif' }}>
          Masalar
        </h1>
        <button onClick={fetchTables} className="btn btn-sm btn-ghost btn-circle text-[#E11383] hover:bg-pink-50">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* Kompakt Özet Kartları - Resimdeki gibi Outline Tasarım */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Toplam */}
        <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-sm flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-gray-500 font-medium">Toplam Masa</span>
            <div className="w-2 h-2 rounded-full bg-gray-500 shadow-sm"></div>
          </div>
          <span className="text-2xl font-normal text-black">{totalTables}</span>
        </div>

        {/* Müsait */}
        <div className="bg-white border border-[#34C759] rounded-lg p-3 shadow-sm flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-gray-500 font-medium">Müsait</span>
            <div className="inline-grid *:[grid-area:1/1]">
              <div className="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_4px_#34C759] animate-ping opacity-75"></div>
              <div className="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_4px_#34C759]"></div>
            </div>
          </div>
          <span className="text-2xl font-normal text-[#34C759]">{availableTables}</span>
        </div>

        {/* Dolu */}
        <div className="bg-white border border-[#F73753] rounded-lg p-3 shadow-sm flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-gray-500 font-medium">Dolu</span>
            <div className="inline-grid *:[grid-area:1/1]">
              <div className="w-2 h-2 rounded-full bg-[#F73753] shadow-[0_0_4px_#F73753] animate-ping opacity-75"></div>
              <div className="w-2 h-2 rounded-full bg-[#F73753] shadow-[0_0_4px_#F73753]"></div>
            </div>
          </div>
          <span className="text-2xl font-normal text-[#F73753]">{occupiedTables}</span>
        </div>
      </div>

      {/* Masa Listesi */}
      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-10 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
          <p>Henüz masa bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {tables.map((table) => {
            const isOccupied = table.status !== 'EMPTY';
            // Görseldeki renk kodları
            const borderColor = isOccupied ? 'border-[#F73753]' : 'border-[#34C759]';
            const dotColor = isOccupied ? 'bg-[#F73753] shadow-[0_0_4px_#F73753]' : 'bg-[#34C759] shadow-[0_0_4px_#34C759]';

            return (
              <div
                key={table.id}
                className={`
                  relative p-5 rounded-3xl h-32 flex flex-col justify-center transition-all bg-white border ${borderColor}
                `}
              >
                {/* Sağ Üstteki Nokta */}
                <div className="absolute top-4 right-4">
                  <div className="inline-grid *:[grid-area:1/1]">
                    <div className={`w-2.5 h-2.5 rounded-full ${dotColor} animate-ping opacity-75`}></div>
                    <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></div>
                  </div>
                </div>

                {/* Info İkonu - Sağ Alt */}
                <button
                  onClick={() => handleInfoClick(table)}
                  className="absolute bottom-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Siparişleri Görüntüle"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </button>

                {/* Masa Adı */}
                <div className="mb-1">
                  <span className="text-xl text-black font-normal truncate block w-full pr-4">
                    {table.name}
                  </span>
                </div>

                {/* Kapasite */}
                <div>
                  <span className="text-sm text-gray-500 font-light">
                    {table.capacity} kişilik
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sipariş Detay Modalı */}
      {isModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#E11383] text-white p-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{selectedTable.name}</h2>
                <p className="text-sm opacity-80">Mevcut Siparişler</p>
              </div>
              <button onClick={closeModal} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              {isLoadingOrders ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md text-[#E11383]"></span>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  <p>Bu masada henüz sipariş bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusLabel = statusLabels[order.status] || order.status;
                    return (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                        {/* Order Header */}
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                            {statusLabel}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Order Items - CartItem Style */}
                        <div className="space-y-3">
                          {order.items?.map((item, index) => (
                            <div key={`${order.id}-item-${index}`} className="bg-gray-50 rounded-xl p-4 space-y-2">
                              <div className="flex gap-3">
                                {/* Item Details */}
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">
                                    {item.menuItemName}
                                  </h3>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {item.price?.toFixed(2)} TL
                                  </p>

                                  {/* Quantity and Total */}
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="inline-flex items-center bg-[#E11383] rounded-xl shadow-md h-8 px-3">
                                      <span className="text-white font-bold text-sm">
                                        {item.quantity}x
                                      </span>
                                    </div>
                                    <span className="text-gray-900 font-semibold">
                                      {(item.price * item.quantity)?.toFixed(2)} TL
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Item Note */}
                              {item.note && (
                                <div className="text-[#E11383] text-sm font-medium flex items-center gap-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Not: {item.note}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Order Total */}
                        <div className="border-t mt-3 pt-3 flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">Toplam</span>
                          <span className="text-lg font-bold text-[#E11383]">₺{order.totalAmount?.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}