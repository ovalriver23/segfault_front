"use client";

import React, { useState } from 'react';

export default function CloseSessionPage() {
    const [tableId, setTableId] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleCloseSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tableId) return;

        setLoading(true);
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

            setMessage({ type: 'success', text: data.message || 'Oturum başarıyla sonlandırıldı.' });
            setTableId(''); // Clear input on success
        } catch (err) {
            setMessage({
                type: 'error',
                text: err instanceof Error ? err.message : 'Bir hata oluştu'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Masa Oturumu Kapatma</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleCloseSession} className="space-y-4">
                    <div>
                        <label htmlFor="tableId" className="block text-sm font-medium text-gray-700 mb-1">
                            Masa ID
                        </label>
                        <input
                            type="text"
                            id="tableId"
                            value={tableId}
                            onChange={(e) => setTableId(e.target.value)}
                            placeholder="Örn: 5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !tableId}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
              ${loading || !tableId
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-200'}`}
                    >
                        {loading ? 'İşleniyor...' : 'Oturumu Sonlandır'}
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
