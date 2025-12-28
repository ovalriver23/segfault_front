'use client';

import { useEffect, useState } from 'react';
import CustomSelect from '../../../components/CustomSelect';

interface Restaurant {
    id: string;
    name: string;
    location: string;
    phoneNumber: string;
    logoUrl: string | null;
    approved: boolean;
    banned: boolean;
    banReason?: string;
    totalRevenue: number;
    totalOrders: number;
    managerUsername: string;
    managerEmail: string;
    managerId: number;
}

export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 8;

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [approvalFilter, setApprovalFilter] = useState<string>('');
    const [banFilter, setBanFilter] = useState<string>('');

    // Ban modal states
    const [showBanModal, setShowBanModal] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [banLoading, setBanLoading] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [banManager, setBanManager] = useState(false);
    const [banStaff, setBanStaff] = useState(false);

    // Info modal state
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoRestaurant, setInfoRestaurant] = useState<Restaurant | null>(null);
    const [showBanReasonInModal, setShowBanReasonInModal] = useState(false);

    useEffect(() => {
        fetchRestaurants(currentPage);
    }, [currentPage, searchTerm, approvalFilter, banFilter]);

    const fetchRestaurants = async (page: number) => {
        try {
            setLoading(true);

            // Build query params
            const params = new URLSearchParams({
                page: page.toString(),
                size: pageSize.toString()
            });

            if (searchTerm) params.append('searchTerm', searchTerm);
            if (approvalFilter !== '') params.append('isApproved', approvalFilter);
            if (banFilter !== '') params.append('isBanned', banFilter);

            const response = await fetch(`/api/Superadmin/restaurants?${params.toString()}`);
            if (!response.ok) throw new Error('Restoranlar yüklenemedi');
            const data = await response.json();
            setRestaurants(data.content || []);
            setTotalElements(data.totalElements || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Hata');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(amount);
    };

    const handlePageChange = (page: number) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setApprovalFilter('');
        setBanFilter('');
        setCurrentPage(0);
    };

    const handleBanClick = (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant);
        setBanReason('');
        setBanManager(true);
        setBanStaff(true);
        setShowBanModal(true);
    };

    const handleBanConfirm = async () => {
        if (!selectedRestaurant) return;
        if (!banReason.trim()) {
            alert('Lütfen banlama nedenini girin');
            return;
        }

        try {
            setBanLoading(true);
            const response = await fetch(`/api/Superadmin/restaurants/${selectedRestaurant.id}/ban`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reason: banReason,
                    banManager: banManager,
                    banStaff: banStaff,
                }),
            });

            if (response.ok) {
                // Refresh the list
                fetchRestaurants(currentPage);
                setShowBanModal(false);
                setSelectedRestaurant(null);
            } else {
                const data = await response.json();
                alert(data.error || 'Banlama işlemi başarısız');
            }
        } catch (err) {
            alert('Bir hata oluştu');
        } finally {
            setBanLoading(false);
        }
    };

    const handleUnban = async (id: string) => {
        if (!confirm('Bu restoranın banını kaldırmak istediğinizden emin misiniz?')) return;

        try {
            const response = await fetch(`/api/Superadmin/restaurants/${id}/unban`, {
                method: 'PUT',
            });

            if (response.ok) {
                fetchRestaurants(currentPage);
            } else {
                const data = await response.json();
                alert(data.error || 'Ban kaldırma işlemi başarısız');
            }
        } catch (err) {
            alert('Bir hata oluştu');
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const buttonStyle = { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#374151' };
        const activeStyle = { backgroundColor: '#e5e7eb', borderColor: '#d1d5db', color: '#374151' };
        const arrowStyle = { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#374151' };

        return (
            <div className="flex justify-center mt-6">
                <div className="join">
                    {/* Previous Arrow */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="join-item btn btn-sm"
                        style={currentPage === 0 ? { ...arrowStyle, opacity: 0.5 } : arrowStyle}
                    >
                        «
                    </button>

                    {/* First Page */}
                    <button
                        onClick={() => handlePageChange(0)}
                        className="join-item btn btn-sm"
                        style={currentPage === 0 ? activeStyle : buttonStyle}
                    >
                        1
                    </button>

                    {/* Middle - Current page or dots */}
                    {totalPages > 2 && currentPage > 0 && currentPage < totalPages - 1 ? (
                        <button
                            className="join-item btn btn-sm"
                            style={activeStyle}
                        >
                            {currentPage + 1}
                        </button>
                    ) : totalPages > 2 ? (
                        <button className="join-item btn btn-sm btn-disabled" style={buttonStyle}>
                            ...
                        </button>
                    ) : null}

                    {/* Last Page (if more than 1 page) */}
                    {totalPages > 1 && (
                        <button
                            onClick={() => handlePageChange(totalPages - 1)}
                            className="join-item btn btn-sm"
                            style={currentPage === totalPages - 1 ? activeStyle : buttonStyle}
                        >
                            {totalPages}
                        </button>
                    )}

                    {/* Next Arrow */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="join-item btn btn-sm"
                        style={currentPage === totalPages - 1 ? { ...arrowStyle, opacity: 0.5 } : arrowStyle}
                    >
                        »
                    </button>
                </div>
            </div>
        );
    };

    if (loading && restaurants.length === 0) return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><div className="animate-spin h-12 w-12 border-b-2 rounded-full" style={{ borderColor: '#004369' }}></div></div>;
    if (error) return <div className="bg-red-50 p-6 rounded-xl text-center"><p className="text-red-600">{error}</p><button onClick={() => fetchRestaurants(currentPage)} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Tekrar Dene</button></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Restoranlar</h1>
                    <p className="text-gray-500 mt-1">Toplam {totalElements} restoran</p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filtreler
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Restoran Ara</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(0);
                                }}
                                placeholder="İsim ile ara..."
                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                            />
                        </div>

                        {/* Approval Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Onay Durumu</label>
                            <CustomSelect
                                value={approvalFilter}
                                onChange={(val) => {
                                    setApprovalFilter(val);
                                    setCurrentPage(0);
                                }}
                                options={[
                                    { value: '', label: 'Tümü' },
                                    { value: 'true', label: 'Onaylı' },
                                    { value: 'false', label: 'Bekleyen' },
                                ]}
                                placeholder="Seçiniz..."
                            />
                        </div>

                        {/* Ban Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Yasaklı Durumu</label>
                            <CustomSelect
                                value={banFilter}
                                onChange={(val) => {
                                    setBanFilter(val);
                                    setCurrentPage(0);
                                }}
                                options={[
                                    { value: '', label: 'Tümü' },
                                    { value: 'true', label: 'Yasaklı' },
                                    { value: 'false', label: 'Aktif' },
                                ]}
                                placeholder="Seçiniz..."
                            />
                        </div>

                        {/* Reset Button */}
                        <div className="flex items-end">
                            <button
                                onClick={handleResetFilters}
                                className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                                style={{ backgroundColor: '#ee46a2' }}
                            >
                                Filtreleri Sıfırla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="border-b" style={{
                        backgroundColor: '#f0a8b0',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23d97706' stroke-width='1.5' stroke-linecap='round'%3E%3Cpath d='M5 5 L8 10'/%3E%3Cpath d='M25 8 L22 12'/%3E%3Cpath d='M45 3 L48 8'/%3E%3Cpath d='M55 15 L52 20'/%3E%3Cpath d='M15 25 L18 30'/%3E%3Cpath d='M35 20 L38 25'/%3E%3Cpath d='M10 40 L13 45'/%3E%3Cpath d='M30 35 L27 40'/%3E%3Cpath d='M50 38 L53 43'/%3E%3Cpath d='M20 50 L23 55'/%3E%3Cpath d='M40 48 L37 53'/%3E%3Cpath d='M58 50 L55 55'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat'
                    }}>
                        <tr>
                            <th className="px-6 py-3 text-left text-base font-bold uppercase text-gray-100" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>Restoran</th>
                            <th className="px-6 py-3 text-left text-base font-bold uppercase text-gray-100" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>Konum</th>
                            <th className="px-6 py-3 text-left text-base font-bold uppercase text-gray-100" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>Manager</th>
                            <th className="px-6 py-3 text-left text-base font-bold uppercase text-gray-100" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>Durum</th>
                            <th className="px-6 py-3 text-right text-base font-bold uppercase text-gray-100" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>Ciro</th>
                            <th className="px-6 py-3 text-center text-base font-bold uppercase text-gray-100" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin h-8 w-8 border-b-2 rounded-full" style={{ borderColor: '#ee46a2' }}></div>
                                    </div>
                                </td>
                            </tr>
                        ) : restaurants.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Restoran bulunamadı
                                </td>
                            </tr>
                        ) : restaurants.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {r.logoUrl ? (
                                            <img
                                                src={r.logoUrl}
                                                alt={r.name}
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-50 border-2 border-orange-400">
                                                <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8V5m0 0a1 1 0 011-1h0a1 1 0 011 1v0a1 1 0 01-1 1h0a1 1 0 01-1-1z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 16c-.5 0-1 .15-1.5.45a2.7 2.7 0 01-3 0 2.7 2.7 0 00-3 0 2.7 2.7 0 01-3 0 2.7 2.7 0 00-3 0 2.7 2.7 0 01-3 0A1.75 1.75 0 003 16v2a2 2 0 002 2h14a2 2 0 002-2v-2zM21 16v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5" />
                                                </svg>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold" style={{ color: '#004369' }}>{r.name}</p>
                                            <p className="text-sm text-gray-500">{r.phoneNumber}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-700">{r.location}</td>
                                <td className="px-6 py-4">
                                    <p style={{ color: '#004369' }}>{r.managerUsername}</p>
                                    <p className="text-sm text-gray-500">{r.managerEmail}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {r.banned ? (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Yasaklı</span>
                                        ) : r.approved ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Onaylı</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">Bekliyor</span>
                                        )}
                                        <button
                                            onClick={() => {
                                                setInfoRestaurant(r);
                                                setShowInfoModal(true);
                                            }}
                                            className="p-1 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                                            title="Detaylar"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <p className="font-semibold" style={{ color: '#004369' }}>{formatCurrency(r.totalRevenue)}</p>
                                    <p className="text-sm text-gray-500">{r.totalOrders} sipariş</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {!r.banned ? (
                                        <button
                                            onClick={() => handleBanClick(r)}
                                            className="px-3 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                                        >
                                            Banla
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUnban(r.id)}
                                            className="px-3 py-1 text-xs font-medium text-red-500 bg-white border-2 border-red-500 hover:bg-red-50 rounded transition-colors"
                                        >
                                            Banı Kaldır
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {renderPagination()}

            {/* Ban Confirmation Modal */}
            {
                showBanModal && selectedRestaurant && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Restoranı Banla</h3>
                            <p className="text-gray-600 mb-4">
                                <span className="font-semibold" style={{ color: '#ee46a2' }}>{selectedRestaurant.name}</span> adlı restoranı banlamak istediğinizden emin misiniz?
                            </p>

                            {/* Banlama Nedeni */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Banlama Nedeni *</label>
                                <input
                                    type="text"
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    placeholder="Örn: Müşteri şikayetleri"
                                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                                />
                            </div>

                            {/* Seçenekler */}
                            <div className="space-y-2 mb-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={banManager}
                                        onChange={(e) => setBanManager(e.target.checked)}
                                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 accent-orange-500"
                                    />
                                    <span className="text-sm text-gray-700">Manager&apos;ı da yasakla</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={banStaff}
                                        onChange={(e) => setBanStaff(e.target.checked)}
                                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 accent-orange-500"
                                    />
                                    <span className="text-sm text-gray-700">Staff&apos;ları da yasakla</span>
                                </label>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowBanModal(false);
                                        setSelectedRestaurant(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    disabled={banLoading}
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleBanConfirm}
                                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                    style={{ backgroundColor: '#dc2626' }}
                                    disabled={banLoading || !banReason.trim()}
                                >
                                    {banLoading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                                    Banla
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Info Modal */}
            {
                showInfoModal && infoRestaurant && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Restoran Detayları</h3>
                                <button
                                    onClick={() => {
                                        setShowInfoModal(false);
                                        setInfoRestaurant(null);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Restaurant Name with Logo */}
                                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'linear-gradient(to right, #fef3f8, #fff8f0)' }}>
                                    {infoRestaurant.logoUrl ? (
                                        <img
                                            src={infoRestaurant.logoUrl}
                                            alt={infoRestaurant.name}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-50 border-2 border-orange-400">
                                            <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8V5m0 0a1 1 0 011-1h0a1 1 0 011 1v0a1 1 0 01-1 1h0a1 1 0 01-1-1z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 16c-.5 0-1 .15-1.5.45a2.7 2.7 0 01-3 0 2.7 2.7 0 00-3 0 2.7 2.7 0 01-3 0 2.7 2.7 0 00-3 0 2.7 2.7 0 01-3 0A1.75 1.75 0 003 16v2a2 2 0 002 2h14a2 2 0 002-2v-2zM21 16v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5" />
                                            </svg>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-500">Restoran Adı</p>
                                        <p className="font-bold text-gray-800">{infoRestaurant.name}</p>
                                    </div>
                                </div>

                                {/* Restaurant ID */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                    <div>
                                        <p className="text-xs text-gray-500">Restoran ID</p>
                                        <p className="text-sm font-mono font-medium text-gray-800">{infoRestaurant.id}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Location */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-500">Konum</p>
                                            <p className="text-sm font-medium text-gray-800">{infoRestaurant.location}</p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-500">Telefon</p>
                                            <p className="text-sm font-medium text-gray-800">{infoRestaurant.phoneNumber}</p>
                                        </div>
                                    </div>

                                    {/* Manager */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-500">Manager</p>
                                            <p className="text-sm font-medium text-gray-800">{infoRestaurant.managerUsername}</p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-500">E-posta</p>
                                            <p className="text-sm font-medium text-gray-800">{infoRestaurant.managerEmail}</p>
                                        </div>
                                    </div>

                                    {/* Manager ID */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-500">Manager ID</p>
                                            <p className="text-sm font-medium text-gray-800">#{infoRestaurant.managerId}</p>
                                        </div>
                                    </div>

                                    {/* Revenue */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-500">Toplam Ciro</p>
                                            <p className="text-sm font-medium text-gray-800">{formatCurrency(infoRestaurant.totalRevenue)}</p>
                                        </div>
                                    </div>

                                    {/* Orders */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-500">Toplam Sipariş</p>
                                            <p className="text-sm font-medium text-gray-800">{infoRestaurant.totalOrders}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex gap-2 pt-2">
                                    {infoRestaurant.approved ? (
                                        <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg font-medium">✓ Onaylı</span>
                                    ) : (
                                        <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-sm rounded-lg font-medium">⏳ Onay Bekliyor</span>
                                    )}
                                    {infoRestaurant.banned && (
                                        <span className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg font-medium">🚫 Yasaklı</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
