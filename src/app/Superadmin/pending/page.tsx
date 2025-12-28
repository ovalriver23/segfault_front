'use client';

import { useEffect, useState } from 'react';

interface Restaurant {
    id: string;
    name: string;
    location: string;
    phoneNumber: string;
    logoUrl: string | null;
    managerUsername: string;
    managerEmail: string;
    managerId: number;
    totalRevenue: number;
    totalOrders: number;
    latitude?: number;
    longitude?: number;
    createdAt?: string;
}

export default function PendingPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/Superadmin/restaurants?page=0&size=50&isApproved=false');
            if (!response.ok) throw new Error('Yüklenemedi');
            const data = await response.json();
            setRestaurants(data.content || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Hata');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            const response = await fetch(`/api/Superadmin/restaurants/${id}/approve`, { method: 'PUT' });
            if (response.ok) {
                setRestaurants(prev => prev.filter(r => r.id !== id));
            } else {
                alert('Onaylama başarısız');
            }
        } catch (err) {
            alert('Hata oluştu');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Red sebebi:');
        if (!reason) return;

        setActionLoading(id);
        try {
            const response = await fetch(`/api/Superadmin/restaurants/${id}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            if (response.ok) {
                setRestaurants(prev => prev.filter(r => r.id !== id));
            } else {
                alert('Reddetme başarısız');
            }
        } catch (err) {
            alert('Hata oluştu');
        } finally {
            setActionLoading(null);
        }
    };

    const handleBulkApprove = async () => {
        if (!confirm('Tüm bekleyen restoranları onaylamak istediğinize emin misiniz?')) return;

        setActionLoading('bulk');
        try {
            const response = await fetch('/api/Superadmin/restaurants/bulk-approve', { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                alert(`${data.count} restoran onaylandı`);
                setRestaurants([]);
            } else {
                alert('Toplu onaylama başarısız');
            }
        } catch (err) {
            alert('Hata oluştu');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-12 w-12 border-b-2 border-purple-500 rounded-full"></div></div>;
    if (error) return <div className="bg-red-50 p-6 rounded-xl text-center"><p className="text-red-600">{error}</p></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Onay Bekleyenler</h1>
                    <p className="text-gray-500 mt-1">{restaurants.length} restoran onay bekliyor</p>
                </div>
                {restaurants.length > 0 && (
                    <button
                        onClick={handleBulkApprove}
                        disabled={actionLoading === 'bulk'}
                        className="text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-colors"
                        style={{ background: 'linear-gradient(to right, #f8a45a, #ee46a2)' }}
                    >
                        {actionLoading === 'bulk' ? 'İşleniyor...' : 'Tümünü Onayla'}
                    </button>
                )}
            </div>

            {restaurants.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Tüm restoranlar onaylı!</h3>
                    <p className="text-gray-500 mt-2">Bekleyen restoran bulunmuyor</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {restaurants.map((r) => (
                        <div key={r.id} className="bg-white rounded-xl p-6 shadow-md">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    {/* Restaurant Icon/Logo */}
                                    {r.logoUrl ? (
                                        <img
                                            src={r.logoUrl}
                                            alt={r.name}
                                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 bg-orange-50 border-2 border-orange-400">
                                            <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8V5m0 0a1 1 0 011-1h0a1 1 0 011 1v0a1 1 0 01-1 1h0a1 1 0 01-1-1z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 16c-.5 0-1 .15-1.5.45a2.7 2.7 0 01-3 0 2.7 2.7 0 00-3 0 2.7 2.7 0 01-3 0 2.7 2.7 0 00-3 0 2.7 2.7 0 01-3 0A1.75 1.75 0 003 16v2a2 2 0 002 2h14a2 2 0 002-2v-2zM21 16v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-gray-800">{r.name}</h3>
                                            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">{r.id}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-3">
                                            <p className="text-gray-500 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {r.location}
                                            </p>
                                            <p className="text-gray-500 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {r.phoneNumber}
                                            </p>
                                            <p className="text-gray-500 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {r.managerUsername}
                                            </p>
                                            <p className="text-gray-500 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                {r.managerEmail}
                                            </p>
                                            <p className="text-gray-500 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                                </svg>
                                                Manager ID: #{r.managerId}
                                            </p>
                                            {r.latitude && r.longitude && (
                                                <p className="text-gray-500 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                    </svg>
                                                    {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                                                </p>
                                            )}
                                            {r.createdAt && (
                                                <p className="text-gray-500 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {new Date(r.createdAt).toLocaleDateString('tr-TR')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprove(r.id)}
                                        disabled={actionLoading === r.id}
                                        className="bg-white border-2 border-green-400 text-green-600 font-semibold py-2 px-4 rounded-lg disabled:opacity-50 transition-all hover:bg-green-50 hover:shadow-lg shadow-md flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {actionLoading === r.id ? '...' : 'Onayla'}
                                    </button>
                                    <button
                                        onClick={() => handleReject(r.id)}
                                        disabled={actionLoading === r.id}
                                        className="bg-white border-2 border-red-500 text-red-600 font-semibold py-2 px-4 rounded-lg disabled:opacity-50 transition-all hover:bg-red-50 hover:shadow-lg shadow-md flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Reddet
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
