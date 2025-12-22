"use client";

import React, { useState, useEffect } from 'react';

type Table = {
    id: number;
    tableNumber: string;
    status: 'EMPTY' | 'OCCUPIED' | 'RESERVED';
    currentSessionId?: number;
    serviceType?: 'DINAR' | 'CAFE';
    waiterName?: string;
};

export default function CloseSessionPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchTables = async () => {
        try {
            const response = await fetch('/api/waiter/tables/get'); // Use existing API route
            if (!response.ok) throw new Error('Masalar yüklenemedi');
            const data = await response.json();
            setTables(data);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Masalar yüklenirken bir hata oluştu' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
        return () => setMessage(null); // Cleanup message on unmount
    }, []); // Run once on mount

    const handleCloseSession = async (tableId: number) => {
        if (!confirm('Bu masanın oturumunu sonlandırmak istediğinize emin misiniz?')) return;

        setProcessingId(tableId);
        setMessage(null);

        try {
            const response = await fetch('/api/close-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tableId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'İşlem başarısız');
            }

            setMessage({ type: 'success', text: `Masa ${tables.find(t => t.id === tableId)?.tableNumber} oturumu kapatıldı.` });
            fetchTables(); // Refresh list
        } catch (err) {
            setMessage({
                type: 'error',
                text: err instanceof Error ? err.message : 'Bir hata oluştu'
            });
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="p-6 text-center">Yükleniyor...</div>;

    const occupiedTables = tables.filter(t => t.status === 'OCCUPIED');

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Açık Oturumlar (Masa Kapatma)</h1>

            {message && (
                <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            {occupiedTables.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-lg shadow text-gray-500">
                    Şu anda açık oturumu olan masa bulunmuyor.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {occupiedTables.map((table) => (
                        <div key={table.id} className="bg-white p-5 rounded-lg shadow-md border-l-4 border-orange-500">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Masa {table.tableNumber}</h3>
                                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold">
                                    DOLU
                                </span>
                            </div>

                            <div className="text-sm text-gray-600 mb-4 space-y-1">
                                {table.waiterName && <p>Garson: <span className="font-medium">{table.waiterName}</span></p>}
                                {table.serviceType && <p>Servis: <span className="font-medium">{table.serviceType === 'DINAR' ? 'Akşam Yemeği' : 'Kafe'}</span></p>}
                            </div>

                            <button
                                onClick={() => handleCloseSession(table.id)}
                                disabled={processingId === table.id}
                                className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
                  ${processingId === table.id
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-200'}`}
                            >
                                {processingId === table.id ? 'Kapatılıyor...' : 'Oturumu Sonlandır'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
