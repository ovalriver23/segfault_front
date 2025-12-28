'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

interface Location {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    approved: boolean;
    banned: boolean;
}

// Dynamic import for Leaflet (client-side only)
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);
const MapController = dynamic(
    () => import('./MapController'),
    { ssr: false }
);

export default function MapPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'banned'>('all');

    // Pagination & Search
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const pageSize = 5;

    // Map control
    const [targetLocation, setTargetLocation] = useState<[number, number] | null>(null);
    const [targetZoom, setTargetZoom] = useState(15);

    useEffect(() => {
        // Add Leaflet CSS via link tag
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Fix Leaflet default marker icons
        import('leaflet').then((L) => {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
        });

        fetchLocations();

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/Superadmin/restaurants/locations');
            if (!response.ok) throw new Error('Lokasyonlar yüklenemedi');
            const data = await response.json();
            setLocations(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Hata');
        } finally {
            setLoading(false);
        }
    };

    const filteredLocations = locations.filter((loc) => {
        // Status filter
        let statusMatch = true;
        if (filter === 'approved') statusMatch = loc.approved && !loc.banned;
        else if (filter === 'pending') statusMatch = !loc.approved;
        else if (filter === 'banned') statusMatch = loc.banned;

        // Search filter
        const searchMatch = searchQuery === '' ||
            loc.name.toLowerCase().includes(searchQuery.toLowerCase());

        return statusMatch && searchMatch;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredLocations.length / pageSize);
    const paginatedLocations = filteredLocations.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    // Reset page when filter or search changes
    useEffect(() => {
        setCurrentPage(0);
    }, [filter, searchQuery]);

    const handleLocationClick = (loc: Location) => {
        setTargetLocation([loc.latitude, loc.longitude]);
        setTargetZoom(15);
        // Scroll to map
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageChange = (page: number) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    // Center on Turkey
    const center: [number, number] = [39.0, 35.0];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[500px]">
                <div className="animate-spin h-12 w-12 border-b-2 border-purple-500 rounded-full"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-6 rounded-xl text-center">
                <p className="text-red-600">{error}</p>
                <button onClick={fetchLocations} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">
                    Tekrar Dene
                </button>
            </div>
        );
    }

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const buttonStyle = { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#374151' };
        const activeStyle = { backgroundColor: '#e5e7eb', borderColor: '#d1d5db', color: '#374151' };
        const arrowStyle = { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#374151' };

        return (
            <div className="flex justify-center mt-4">
                <div className="join">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="join-item btn btn-sm"
                        style={currentPage === 0 ? { ...arrowStyle, opacity: 0.5 } : arrowStyle}
                    >
                        «
                    </button>
                    <button
                        onClick={() => handlePageChange(0)}
                        className="join-item btn btn-sm"
                        style={currentPage === 0 ? activeStyle : buttonStyle}
                    >
                        1
                    </button>
                    {totalPages > 2 && currentPage > 0 && currentPage < totalPages - 1 ? (
                        <button className="join-item btn btn-sm" style={activeStyle}>
                            {currentPage + 1}
                        </button>
                    ) : totalPages > 2 ? (
                        <button className="join-item btn btn-sm btn-disabled" style={buttonStyle}>
                            ...
                        </button>
                    ) : null}
                    {totalPages > 1 && (
                        <button
                            onClick={() => handlePageChange(totalPages - 1)}
                            className="join-item btn btn-sm"
                            style={currentPage === totalPages - 1 ? activeStyle : buttonStyle}
                        >
                            {totalPages}
                        </button>
                    )}
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Harita</h1>
                <p className="text-gray-500 mt-1">Tüm restoranların konumlarını görüntüleyin</p>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl p-4 shadow-md flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'all' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    style={filter === 'all' ? { backgroundColor: '#f8a45a' } : {}}
                >
                    Tümü ({locations.length})
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'approved' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    style={filter === 'approved' ? { backgroundColor: '#f8a45a' } : {}}
                >
                    Onaylı ({locations.filter(l => l.approved && !l.banned).length})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'pending' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    style={filter === 'pending' ? { backgroundColor: '#f8a45a' } : {}}
                >
                    Bekleyen ({locations.filter(l => !l.approved).length})
                </button>
                <button
                    onClick={() => setFilter('banned')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'banned' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    style={filter === 'banned' ? { backgroundColor: '#f8a45a' } : {}}
                >
                    Yasaklı ({locations.filter(l => l.banned).length})
                </button>
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden" style={{ height: '500px' }}>
                {typeof window !== 'undefined' && (
                    <MapContainer
                        center={center}
                        zoom={6}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapController center={targetLocation} zoom={targetZoom} />
                        {filteredLocations.map((loc) => (
                            <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
                                <Popup>
                                    <div className="text-center">
                                        <h3 className="font-bold text-gray-800">{loc.name}</h3>
                                        <div className="flex gap-1 justify-center mt-2">
                                            {loc.approved && !loc.banned && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Onaylı</span>
                                            )}
                                            {!loc.approved && (
                                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">Bekleyen</span>
                                            )}
                                            {loc.banned && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Yasaklı</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>

            {/* Locations List with Pagination */}
            <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Restoran Listesi ({filteredLocations.length})</h3>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Restoran ara..."
                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                    />
                </div>

                <div className="space-y-2">
                    {paginatedLocations.map((loc) => (
                        <div
                            key={loc.id}
                            onClick={() => handleLocationClick(loc)}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-pink-50 hover:border-pink-200 border border-transparent transition-colors"
                        >
                            <div>
                                <p className="font-semibold text-gray-800">{loc.name}</p>
                                <p className="text-xs text-gray-500">📍 {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</p>
                            </div>
                            <div className="flex gap-1 items-center">
                                {loc.approved && !loc.banned && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Onaylı</span>}
                                {!loc.approved && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">Bekleyen</span>}
                                {loc.banned && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Yasaklı</span>}
                                <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                    {filteredLocations.length === 0 && (
                        <p className="text-center text-gray-500 py-4">Bu kategoride restoran yok</p>
                    )}
                </div>
                {renderPagination()}
            </div>
        </div>
    );
}
