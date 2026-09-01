'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePageTitle } from '../../layout';
import { useAuth } from '@/app/lib/context/AuthContext';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import Leaflet components to avoid SSR issues
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

// Import the map click handler component separately
const MapClickHandler = dynamic<{ onMapClick: (lat: number, lng: number) => void; center: [number, number] }>(
    () => import('./MapClickHandler' as any).then((mod) => mod.default),
    { ssr: false }
);

interface FormData {
    username: string;
    email: string;
    restaurantName: string;
    restaurantLocation: string;
    latitude: string;
    longitude: string;
    profilePhoto: File | null;
    restaurantLogo: File | null;
}

export default function EditRestaurantPage() {
    const router = useRouter();
    const { setPageTitle } = usePageTitle();
    const { user, refreshUser } = useAuth();
    const profilePhotoRef = useRef<HTMLInputElement>(null);
    const restaurantLogoRef = useRef<HTMLInputElement>(null);
    const feedbackRef = useRef<HTMLDivElement>(null);
    const hasUnsavedChangesRef = useRef(false);

    const [formData, setFormData] = useState<FormData>({
        username: '',
        email: '',
        restaurantName: '',
        restaurantLocation: '',
        latitude: '',
        longitude: '',
        profilePhoto: null,
        restaurantLogo: null,
    });

    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [mapPosition, setMapPosition] = useState<[number, number]>([41.0082, 28.9784]); // Default: Istanbul
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isMapReady, setIsMapReady] = useState(false);

    // Refresh the persistent auth context whenever this page is opened.
    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);

    // Pre-populate form with current user data without overwriting active edits.
    useEffect(() => {
        if (user && !hasUnsavedChangesRef.current) {
            setFormData(prev => ({
                ...prev,
                username: user.username || '',
                email: user.email || '',
                restaurantName: user.restaurantName || '',
                restaurantLocation: user.restaurantLocation || '',
                latitude: user.latitude?.toString() || '',
                longitude: user.longitude?.toString() || '',
            }));
            setProfilePreview(user.profilePhotoUrl || null);
            setLogoPreview(user.restaurantLogoUrl || null);
            // Set map position if coordinates exist
            if (user.latitude != null && user.longitude != null) {
                setMapPosition([user.latitude, user.longitude]);
            }
        }
    }, [user]);

    useEffect(() => {
        setPageTitle('Profil Düzenle');

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

        // Set map ready after component mounts (for SSR)
        setIsMapReady(true);

        return () => {
            document.head.removeChild(link);
        };
    }, [setPageTitle]);

    // Update form data when map position changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            latitude: mapPosition[0].toFixed(6),
            longitude: mapPosition[1].toFixed(6),
        }));
    }, [mapPosition]);

    useEffect(() => {
        if (!successMessage && !errorMessage) return;

        const animationFrame = window.requestAnimationFrame(() => {
            feedbackRef.current?.focus({ preventScroll: true });
            feedbackRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        });

        return () => window.cancelAnimationFrame(animationFrame);
    }, [successMessage, errorMessage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        hasUnsavedChangesRef.current = true;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePhoto' | 'restaurantLogo') => {
        const file = e.target.files?.[0];
        if (file) {
            hasUnsavedChangesRef.current = true;
            setFormData(prev => ({ ...prev, [field]: file }));

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                if (field === 'profilePhoto') {
                    setProfilePreview(reader.result as string);
                } else {
                    setLogoPreview(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleLatLongChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        hasUnsavedChangesRef.current = true;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Update map position if both lat and long are valid
        const lat = name === 'latitude' ? parseFloat(value) : parseFloat(formData.latitude);
        const lng = name === 'longitude' ? parseFloat(value) : parseFloat(formData.longitude);

        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            setMapPosition([lat, lng]);
        }

        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleMapClick = (lat: number, lng: number) => {
        hasUnsavedChangesRef.current = true;
        setMapPosition([lat, lng]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        // Check if at least one field is filled
        const hasData = formData.username || formData.email || formData.restaurantName ||
            formData.restaurantLocation || formData.latitude || formData.longitude ||
            formData.profilePhoto || formData.restaurantLogo;

        if (!hasData) {
            setErrorMessage('En az bir alan doldurulmalıdır');
            return;
        }

        // Validate latitude and longitude if provided
        if (formData.latitude) {
            const lat = parseFloat(formData.latitude);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                setErrorMessage('Enlem -90 ile 90 arasında olmalıdır');
                return;
            }
        }

        if (formData.longitude) {
            const lng = parseFloat(formData.longitude);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                setErrorMessage('Boylam -180 ile 180 arasında olmalıdır');
                return;
            }
        }

        setIsLoading(true);

        try {
            const submitData = new FormData();

            if (formData.username) submitData.append('username', formData.username);
            if (formData.email) submitData.append('email', formData.email);
            if (formData.restaurantName) submitData.append('restaurantName', formData.restaurantName);
            if (formData.restaurantLocation) submitData.append('restaurantLocation', formData.restaurantLocation);
            if (formData.latitude) submitData.append('latitude', formData.latitude);
            if (formData.longitude) submitData.append('longitude', formData.longitude);
            if (formData.profilePhoto) submitData.append('profilePhoto', formData.profilePhoto);
            if (formData.restaurantLogo) submitData.append('restaurantLogo', formData.restaurantLogo);

            const response = await fetch('/api/dashboard/settings/edit-restaurant', {
                method: 'PUT',
                body: submitData,
            });

            const data = await response.json();

            if (response.ok) {
                hasUnsavedChangesRef.current = false;
                await refreshUser();
                setSuccessMessage(data.message || 'Profil başarıyla güncellendi');

                // Redirect to settings page after 2 seconds
                setTimeout(() => {
                    router.push('/dashboard/settings');
                }, 2000);
            } else {
                setErrorMessage(data.error || 'Profil güncellenemedi');
            }
        } catch (error) {
            setErrorMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/settings');
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={handleCancel}
                        className="btn btn-ghost btn-sm btn-circle text-text-400 hover:text-text-600 hover:bg-primary-50 hover:border-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-text-500">Profil ve Restoran Düzenle</h1>
                        <p className="text-text-300 mt-1">Profil ve restoran bilgilerinizi güncelleyin</p>
                    </div>
                </div>
            </div>

            {/* Alert Messages */}
            {successMessage && (
                <div
                    ref={feedbackRef}
                    role="alert"
                    tabIndex={-1}
                    className="alert alert-success bg-green-50 border-green-200 text-green-800 mb-6 focus:outline-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div
                    ref={feedbackRef}
                    role="alert"
                    tabIndex={-1}
                    className="alert alert-error bg-red-50 border-red-200 text-red-800 mb-6 focus:outline-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Information Card */}
                <div className="card bg-white shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title text-text-500 text-lg mb-4">Kullanıcı Bilgileri</h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Username */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-text-500 font-medium">Kullanıcı Adı</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Kullanıcı adınız"
                                    className="input input-bordered w-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Email */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-text-500 font-medium">E-posta</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="E-posta adresiniz"
                                    className="input input-bordered w-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Profile Photo */}
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text text-text-500 font-medium">Profil Fotoğrafı</span>
                            </label>
                            <div className="flex items-center gap-4">
                                {profilePreview ? (
                                    <div className="avatar">
                                        <div className="w-20 h-20 rounded-full ring ring-primary-200">
                                            <Image src={profilePreview} alt="Profil önizleme" fill className="object-cover" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="avatar placeholder">
                                        <div className="bg-gray-200 text-gray-500 rounded-full w-20 h-20 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={profilePhotoRef}
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'profilePhoto')}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => profilePhotoRef.current?.click()}
                                    className="btn btn-outline btn-primary border-secondary-500 text-secondary-500 hover:bg-secondary-500 hover:text-white"
                                    disabled={isLoading}
                                >
                                    Fotoğraf Seç
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Restaurant Information Card */}
                <div className="card bg-white shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title text-text-500 text-lg mb-4">Restoran Bilgileri</h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Restaurant Name */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-text-500 font-medium">Restoran Adı</span>
                                </label>
                                <input
                                    type="text"
                                    name="restaurantName"
                                    value={formData.restaurantName}
                                    onChange={handleChange}
                                    placeholder="Restoran adınız"
                                    className="input input-bordered w-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Restaurant Logo */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-text-500 font-medium">Restoran Logosu</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    {logoPreview ? (
                                        <div className="avatar">
                                            <div className="w-16 h-16 rounded-lg ring ring-primary-200">
                                                <Image src={logoPreview} alt="Logo önizleme" fill className="object-cover" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="avatar placeholder">
                                            <div className="bg-gray-200 text-gray-500 rounded-lg w-16 h-16 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={restaurantLogoRef}
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'restaurantLogo')}
                                        className="hidden"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => restaurantLogoRef.current?.click()}
                                        className="btn btn-outline btn-primary btn-sm border-secondary-500 text-secondary-500 hover:bg-secondary-500 hover:text-white"
                                        disabled={isLoading}
                                    >
                                        Logo Seç
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Restaurant Location */}
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text text-text-500 font-medium">Adres</span>
                            </label>
                            <input
                                type="text"
                                name="restaurantLocation"
                                value={formData.restaurantLocation}
                                onChange={handleChange}
                                placeholder="Restoran adresi"
                                className="input input-bordered w-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                {/* Location Card with Map */}
                <div className="card bg-white shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title text-text-500 text-lg mb-4">Konum</h2>
                        <p className="text-text-300 text-sm mb-4">
                            Haritadan tıklayarak veya koordinatları girerek konumunuzu belirleyin
                        </p>

                        {/* Map */}
                        {isMapReady && typeof window !== 'undefined' && (
                            <div className="w-full h-64 rounded-lg overflow-hidden mb-4 border border-gray-200">
                                <MapContainer
                                    center={mapPosition}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={mapPosition} />
                                    <MapClickHandler onMapClick={handleMapClick} center={mapPosition} />
                                </MapContainer>
                            </div>
                        )}


                    </div>
                </div>

                {/* Info Box */}
                <div className="alert bg-primary-50 border-primary-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-primary-600 shrink-0 w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-primary-700 text-sm">
                        Sadece değiştirmek istediğiniz alanları doldurun. Boş bırakılan alanlar güncellenmez.
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="btn btn-primary bg-primary-500 hover:bg-primary-600 border-none text-white flex-1"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Kaydediliyor...
                            </>
                        ) : (
                            'Değişiklikleri Kaydet'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn-ghost hover:border-red-100 text-text-500 hover:bg-red-100"
                        disabled={isLoading}
                    >
                        İptal
                    </button>
                </div>
            </form>
        </div>
    );
}
