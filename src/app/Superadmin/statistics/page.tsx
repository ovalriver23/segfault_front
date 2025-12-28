'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Restaurant {
    id: string;
    name: string;
    logoUrl: string | null;
    approved: boolean;
    banned: boolean;
    totalRevenue: number;
    totalOrders: number;
}

interface Statistics {
    totalRevenue: number;
    totalOrders: number;
    totalTables: number;
    totalStaff: number;
    averageOrderValue: number;
}

// Theme colors matching the Superadmin design
const THEME_COLORS = {
    primary: '#ee46a2',    // Pink
    secondary: '#f8a45a',  // Orange
    accent: '#004369',     // Dark blue
    success: '#22c55e',    // Green
    warning: '#f97316',    // Orange
    danger: '#ef4444',     // Red
};

const PIE_COLORS = ['#f0a8b0', '#f8a45a', '#ef4444'];

export default function StatisticsPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [stats, setStats] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownPage, setDropdownPage] = useState(0);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        if (selectedId) {
            fetchStats(selectedId);
        }
    }, [selectedId]);

    const fetchRestaurants = async () => {
        try {
            const response = await fetch('/api/Superadmin/restaurants?page=0&size=100');
            if (response.ok) {
                const data = await response.json();
                setRestaurants(data.content || []);
                if (data.content?.length > 0) {
                    setSelectedId(data.content[0].id);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async (id: string) => {
        setStatsLoading(true);
        try {
            const response = await fetch(`/api/Superadmin/restaurants/${id}/statistics`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setStatsLoading(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(val);

    // Pie chart data for restaurant status distribution
    const statusData = [
        { name: 'Onaylı', value: restaurants.filter(r => r.approved && !r.banned).length },
        { name: 'Bekleyen', value: restaurants.filter(r => !r.approved).length },
        { name: 'Yasaklı', value: restaurants.filter(r => r.banned).length },
    ].filter(d => d.value > 0);

    // Bar chart data for top restaurants
    const topRestaurants = [...restaurants]
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5)
        .map(r => ({ name: r.name.slice(0, 12), ciro: r.totalRevenue, siparis: r.totalOrders }));

    const selectedRestaurant = restaurants.find(r => r.id === selectedId);

    // Calculate totals
    const totalRevenue = restaurants.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalOrders = restaurants.reduce((sum, r) => sum + r.totalOrders, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <div className="animate-spin h-12 w-12 border-b-2 rounded-full" style={{ borderColor: THEME_COLORS.primary }}></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold" style={{ color: THEME_COLORS.accent }}>İstatistikler</h1>
                <p className="text-gray-500 mt-1">Sistem ve restoran istatistiklerini görüntüleyin</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-md border-l-4" style={{ borderColor: '#ee46a2' }}>
                    <p className="text-sm text-gray-500">Toplam Restoran</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: '#ee46a2' }}>{restaurants.length}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-md border-l-4" style={{ borderColor: '#f06090' }}>
                    <p className="text-sm text-gray-500">Toplam Ciro</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#f06090' }}>{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-md border-l-4" style={{ borderColor: '#f48070' }}>
                    <p className="text-sm text-gray-500">Toplam Sipariş</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: '#f48070' }}>{totalOrders}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-md border-l-4" style={{ borderColor: '#f8a45a' }}>
                    <p className="text-sm text-gray-500">Ortalama Sipariş</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#f8a45a' }}>
                        {formatCurrency(totalOrders > 0 ? totalRevenue / totalOrders : 0)}
                    </p>
                </div>
            </div>

            {/* Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart - Status Distribution */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-bold mb-4" style={{ color: THEME_COLORS.accent }}>Restoran Durumları</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <defs>
                                <pattern id="confettiPattern" patternUnits="userSpaceOnUse" width="80" height="80">
                                    <rect width="80" height="80" fill="#f0a8b0" />
                                    <line x1="10" y1="5" x2="15" y2="12" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                                    <line x1="55" y1="18" x2="48" y2="25" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                                    <line x1="30" y1="50" x2="38" y2="55" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                                    <line x1="70" y1="60" x2="65" y2="68" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                                </pattern>
                            </defs>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={index === 0 ? 'url(#confettiPattern)' : PIE_COLORS[index]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                        {statusData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }}></div>
                                <span className="text-sm text-gray-600">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bar Chart - Top Restaurants */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-bold mb-4" style={{ color: THEME_COLORS.accent }}>En Çok Ciro Yapanlar</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={topRestaurants} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} />
                            <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#666', fontSize: 12 }} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                                                <p className="text-sm font-bold text-gray-800">{payload[0].payload.name}</p>
                                                <p className="text-sm" style={{ color: THEME_COLORS.primary }}>
                                                    ciro: {formatCurrency(Number(payload[0].value) || 0)}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="ciro" fill={THEME_COLORS.primary} radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Restaurant Detail Stats */}
            <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <h3 className="text-lg font-bold" style={{ color: THEME_COLORS.accent }}>Restoran Detay İstatistikleri</h3>

                    {/* Custom Searchable Dropdown with Pagination */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none bg-white min-w-[200px] text-left flex items-center justify-between text-gray-800"
                            style={{ borderColor: dropdownOpen ? THEME_COLORS.primary : undefined }}
                        >
                            <span className="truncate font-medium">{selectedRestaurant?.name || 'Restoran Seçin'}</span>
                            <svg className={`w-4 h-4 ml-2 transition-transform text-gray-600 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
                                {/* Search Input */}
                                <div className="p-2 border-b">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Restoran ara..."
                                            value={searchTerm}
                                            onChange={(e) => { setSearchTerm(e.target.value); setDropdownPage(0); }}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2"
                                            style={{ '--tw-ring-color': THEME_COLORS.primary } as React.CSSProperties}
                                        />
                                    </div>
                                </div>

                                {/* Filtered & Paginated List */}
                                <div className="max-h-48 overflow-y-auto">
                                    {(() => {
                                        const filtered = restaurants.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
                                        const paginated = filtered.slice(dropdownPage * ITEMS_PER_PAGE, (dropdownPage + 1) * ITEMS_PER_PAGE);
                                        const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

                                        return (
                                            <>
                                                {paginated.map((r) => (
                                                    <button
                                                        key={r.id}
                                                        onClick={() => { setSelectedId(r.id); setDropdownOpen(false); }}
                                                        className={`w-full px-4 py-2 text-left text-sm text-gray-800 hover:bg-pink-50 ${selectedId === r.id ? 'bg-pink-100 font-medium' : ''}`}
                                                    >
                                                        {r.name}
                                                    </button>
                                                ))}
                                                {paginated.length === 0 && (
                                                    <p className="px-4 py-3 text-sm text-gray-500">Sonuç bulunamadı</p>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Pagination */}
                                {(() => {
                                    const filtered = restaurants.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
                                    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
                                    if (totalPages <= 1) return null;

                                    return (
                                        <div className="flex items-center justify-between p-2 border-t">
                                            <button
                                                onClick={() => setDropdownPage(p => Math.max(0, p - 1))}
                                                disabled={dropdownPage === 0}
                                                className="px-2 py-1 text-xs rounded disabled:opacity-50"
                                                style={{ color: THEME_COLORS.primary }}
                                            >
                                                ← Önceki
                                            </button>
                                            <span className="text-xs text-gray-500">{dropdownPage + 1} / {totalPages}</span>
                                            <button
                                                onClick={() => setDropdownPage(p => Math.min(totalPages - 1, p + 1))}
                                                disabled={dropdownPage >= totalPages - 1}
                                                className="px-2 py-1 text-xs rounded disabled:opacity-50"
                                                style={{ color: THEME_COLORS.primary }}
                                            >
                                                Sonraki →
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>

                {statsLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-b-2 rounded-full" style={{ borderColor: THEME_COLORS.primary }}></div>
                    </div>
                ) : stats && selectedRestaurant ? (
                    <div className="space-y-6">
                        {/* Restaurant Info */}
                        <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'linear-gradient(to right, #fef3f8, #fff8f0)' }}>
                            {selectedRestaurant.logoUrl ? (
                                <img
                                    src={selectedRestaurant.logoUrl}
                                    alt={selectedRestaurant.name}
                                    className="w-14 h-14 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-orange-50 border-2 border-orange-400">
                                    <svg className="w-7 h-7 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8V5m0 0a1 1 0 011-1h0a1 1 0 011 1v0a1 1 0 01-1 1h0a1 1 0 01-1-1z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 16c-.5 0-1 .15-1.5.45a2.7 2.7 0 01-3 0 2.7 2.7 0 00-3 0 2.7 2.7 0 01-3 0 2.7 2.7 0 00-3 0 2.7 2.7 0 01-3 0A1.75 1.75 0 003 16v2a2 2 0 002 2h14a2 2 0 002-2v-2zM21 16v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5" />
                                    </svg>
                                </div>
                            )}
                            <div>
                                <h4 className="font-bold text-lg" style={{ color: THEME_COLORS.accent }}>{selectedRestaurant.name}</h4>
                                <div className="flex gap-2 mt-1">
                                    {selectedRestaurant.approved && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Onaylı</span>}
                                    {!selectedRestaurant.approved && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">Bekliyor</span>}
                                    {selectedRestaurant.banned && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Yasaklı</span>}
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#fef3f8' }}>
                                <p className="text-2xl font-bold" style={{ color: THEME_COLORS.primary }}>{formatCurrency(stats.totalRevenue)}</p>
                                <p className="text-sm text-gray-500 mt-1">Toplam Ciro</p>
                            </div>
                            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#fff8f0' }}>
                                <p className="text-2xl font-bold" style={{ color: THEME_COLORS.secondary }}>{stats.totalOrders}</p>
                                <p className="text-sm text-gray-500 mt-1">Sipariş</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{stats.totalTables}</p>
                                <p className="text-sm text-gray-500 mt-1">Masa</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold" style={{ color: THEME_COLORS.accent }}>{stats.totalStaff}</p>
                                <p className="text-sm text-gray-500 mt-1">Personel</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-700">{formatCurrency(stats.averageOrderValue)}</p>
                                <p className="text-sm text-gray-500 mt-1">Ort. Sipariş</p>
                            </div>
                        </div>

                        {/* Progress Bars */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 font-medium">Ciro Performansı</span>
                                    <span className="font-semibold" style={{ color: THEME_COLORS.primary }}>{formatCurrency(stats.totalRevenue)}</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(100, (stats.totalRevenue / 100000) * 100)}%`,
                                            backgroundColor: THEME_COLORS.primary
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 font-medium">Sipariş Performansı</span>
                                    <span className="font-semibold" style={{ color: THEME_COLORS.secondary }}>{stats.totalOrders} sipariş</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(100, (stats.totalOrders / 500) * 100)}%`,
                                            backgroundColor: THEME_COLORS.secondary
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 font-medium">Kapasite Kullanımı</span>
                                    <span className="font-semibold text-green-600">{stats.totalTables} masa / {stats.totalStaff} personel</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, ((stats.totalTables + stats.totalStaff) / 50) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">Restoran seçin</p>
                )}
            </div>
        </div>
    );
}
