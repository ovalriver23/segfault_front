'use client';

import { useEffect, useState } from 'react';
import { usePageTitle } from './layout';
import Link from 'next/link';

interface Restaurant {
    id: string;
    name: string;
    location: string;
    approved: boolean;
    banned: boolean;
    totalRevenue: number;
    totalOrders: number;
}

export default function SuperadminDashboard() {
    const { setPageTitle } = usePageTitle();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        banned: 0,
        revenue: 0,
    });
    const [note, setNote] = useState('');

    useEffect(() => {
        const savedNote = localStorage.getItem('superadmin_dashboard_note');
        if (savedNote) setNote(savedNote);
    }, []);

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newNote = e.target.value;
        setNote(newNote);
        localStorage.setItem('superadmin_dashboard_note', newNote);
    };

    useEffect(() => {
        setPageTitle('Dashboard');
        fetchData();
    }, [setPageTitle]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/Superadmin/restaurants?page=0&size=100');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API Hatası: ${response.status}`);
            }

            const data = await response.json();
            const allRestaurants = data.content || [];

            // Calculate stats
            const pending = allRestaurants.filter((r: Restaurant) => !r.approved).length;
            const banned = allRestaurants.filter((r: Restaurant) => r.banned).length;
            const revenue = allRestaurants.reduce((sum: number, r: Restaurant) => sum + (r.totalRevenue || 0), 0);

            setStats({
                total: data.totalElements || allRestaurants.length,
                pending,
                banned,
                revenue,
            });

            // Get last 5 restaurants
            setRestaurants(allRestaurants.slice(0, 5));
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#004369' }}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Hata</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={fetchData} className="bg-red-600 text-white py-2 px-4 rounded-lg">
                    Tekrar Dene
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Superadmin Dashboard</h2>
                <h1 className="text-5xl md:text-6xl font-bold mb-3 drop-shadow-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-pink-500 bg-clip-text text-transparent">Hoşgeldin &lt;segfault&gt;</span>
                </h1>
                <p className="text-gray-500 mt-2">Tüm restoranları yönetin ve sistem istatistiklerini görüntüleyin</p>
            </div>

            {/* Stats Cards - 4 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-sm text-gray-600">Toplam Restoran</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#004369' }}>{stats.total}</p>
                </div>
                <Link href="/Superadmin/pending">
                    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg cursor-pointer">
                        <p className="text-sm text-gray-600">Onay Bekleyen</p>
                        <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</p>
                    </div>
                </Link>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-sm text-gray-600">Yasaklı</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.banned}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-sm text-gray-600">Toplam Ciro</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(stats.revenue)}</p>
                </div>
            </div>

            {/* Personal Note Area */}
            <div className="mt-10 w-full bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50/30 via-white to-pink-50/30 pointer-events-none"></div>

                {/* Decorative Background Waves */}
                <svg className="w-full h-full absolute inset-0 pointer-events-none opacity-40" preserveAspectRatio="none" viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>
                    <path d="M0 80 C 300 100, 600 40, 1200 80" stroke="url(#waveGradient1)" strokeWidth="1" fill="none" />
                </svg>

                <div className="relative z-10 p-6 flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Notlarım</span>
                    </div>
                    <textarea
                        value={note}
                        onChange={handleNoteChange}
                        placeholder="Bugün için notlarınız..."
                        className="w-full h-24 bg-transparent border-none resize-none focus:ring-0 text-gray-700 placeholder-gray-300 text-lg font-handwriting leading-relaxed"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/Superadmin/pending">
                    <div className="bg-white rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute bottom-0 left-4 right-0 h-1" style={{ background: 'linear-gradient(to right, #f8a45a, #f8a45acc, transparent)' }}></div>
                        <div className="absolute top-0 bottom-4 left-0 w-1" style={{ background: 'linear-gradient(to bottom, transparent, #f8a45a, #f8a45a)' }}></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 rounded-bl-xl" style={{ backgroundColor: '#f8a45a' }}></div>
                        <div className="absolute bottom-1 left-1 w-3 h-3 bg-white" style={{ borderBottomLeftRadius: '0.5rem' }}></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Onay Bekleyenleri İncele</h3>
                                <p className="text-gray-500 text-sm">{stats.pending} restoran onay bekliyor</p>
                            </div>
                            <svg className="w-6 h-6" style={{ color: '#f8a45a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        </div>
                    </div>
                </Link>
                <Link href="/Superadmin/restaurants">
                    <div className="bg-white rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute bottom-0 left-4 right-0 h-1" style={{ background: 'linear-gradient(to right, #ee46a2, #ee46a2cc, transparent)' }}></div>
                        <div className="absolute top-0 bottom-4 left-0 w-1" style={{ background: 'linear-gradient(to bottom, transparent, #ee46a2, #ee46a2)' }}></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 rounded-bl-xl" style={{ backgroundColor: '#ee46a2' }}></div>
                        <div className="absolute bottom-1 left-1 w-3 h-3 bg-white" style={{ borderBottomLeftRadius: '0.5rem' }}></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Tüm Restoranları Görüntüle</h3>
                                <p className="text-gray-500 text-sm">Restoranları yönet ve filtrele</p>
                            </div>
                            <svg className="w-6 h-6" style={{ color: '#ee46a2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
