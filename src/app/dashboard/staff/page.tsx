'use client';

import { useState, useEffect, useRef } from 'react';
import { z } from 'zod';

// --- TİPLER ---
interface Staff {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  profilePhotoUrl?: string | null;
}

// --- ZOD ŞEMALARI ---
const addStaffSchema = z.object({
  firstName: z.string().min(2, 'İsim en az 2 karakter').max(50),
  lastName: z.string().min(2, 'Soyisim en az 2 karakter').max(50),
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter').max(20),
  email: z.string().email('Geçerli email giriniz'),
  phoneNumber: z.string().min(10, 'Telefon numarası en az 10 hane olmalıdır'),
  password: z.string().min(8, 'Şifre en az 8 karakter'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'])
});

const editStaffSchema = z.object({
  firstName: z.string().min(2, 'İsim en az 2 karakter').max(50),
  lastName: z.string().min(2, 'Soyisim en az 2 karakter').max(50),
  email: z.string().email('Geçerli email giriniz'),
  phoneNumber: z.string().min(10, 'Telefon numarası en az 10 hane olmalıdır'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'])
});

export default function StaffPage() {
  // --- STATE ---
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [modalType, setModalType] = useState<'ADD' | 'EDIT' | 'INFO' | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    gender: 'MALE',
  });

  // Profile Photo State
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // --- EFFECT ---
  useEffect(() => {
    fetchStaff();
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
    };
  }, [profilePhotoPreview]);

  // --- API FONKSİYONLARI ---
  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard/staff/get', { cache: 'no-store' });
      if (!response.ok) throw new Error('Veri alınamadı');
      const data = await response.json();
      setStaffList(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    if (!confirm('Bu personeli silmek istediğinize emin misiniz?')) return;
    try {
      const response = await fetch(`/api/dashboard/staff/delete?id=${staffId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Silinemedi');
      setStaffList(prev => prev.filter(s => s.id !== staffId));
    } catch (error: any) {
      alert(error.message);
    }
  };

  // --- HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePhoto: 'Sadece resim dosyaları yüklenebilir' }));
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePhoto: 'Dosya boyutu 2MB\'dan küçük olmalıdır' }));
        return;
      }

      // Clear previous preview
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview);
      }

      setProfilePhoto(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, profilePhoto: '' }));
    }
  };

  const handleRemovePhoto = () => {
    if (profilePhotoPreview) {
      URL.revokeObjectURL(profilePhotoPreview);
    }
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
    setExistingPhotoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openModal = (type: 'ADD' | 'EDIT' | 'INFO', staff?: Staff) => {
    setModalType(type);
    setApiError(null);
    setErrors({});
    setProfilePhoto(null);
    if (profilePhotoPreview) {
      URL.revokeObjectURL(profilePhotoPreview);
    }
    setProfilePhotoPreview(null);

    if (type === 'ADD') {
      setFormData({
        username: '', firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', gender: 'MALE'
      });
      setExistingPhotoUrl(null);
    } else if (staff) {
      setSelectedStaffId(staff.id);
      setFormData({
        username: staff.username,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email || '',
        phoneNumber: staff.phoneNumber || '',
        gender: staff.gender || 'MALE',
        password: '',
        confirmPassword: ''
      });
      setExistingPhotoUrl(staff.profilePhotoUrl || null);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedStaffId(null);
    if (profilePhotoPreview) {
      URL.revokeObjectURL(profilePhotoPreview);
    }
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setErrors({});

    // 1. Validasyon
    try {
      if (modalType === 'ADD') {
        addStaffSchema.parse(formData);
        if (formData.password !== formData.confirmPassword) {
          setErrors({ confirmPassword: 'Şifreler eşleşmiyor' });
          return;
        }
      } else if (modalType === 'EDIT') {
        editStaffSchema.parse(formData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach(err => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
        setErrors(fieldErrors);
        return;
      }
    }

    // 2. API İsteği - FormData kullan
    setIsSubmitting(true);
    try {
      let response;

      if (modalType === 'ADD') {
        // FormData oluştur
        const submitFormData = new FormData();
        submitFormData.append('username', formData.username);
        submitFormData.append('password', formData.password);
        submitFormData.append('firstName', formData.firstName);
        submitFormData.append('lastName', formData.lastName);
        submitFormData.append('gender', formData.gender);
        submitFormData.append('email', formData.email);
        submitFormData.append('phoneNumber', formData.phoneNumber.replace(/\s/g, ''));

        // Profil fotoğrafı varsa ekle
        if (profilePhoto) {
          submitFormData.append('profilePhoto', profilePhoto);
        }

        response = await fetch('/api/dashboard/staff/add', {
          method: 'POST',
          body: submitFormData,
        });
      } else if (modalType === 'EDIT' && selectedStaffId) {
        // Edit için de FormData kullan
        const submitFormData = new FormData();
        submitFormData.append('firstName', formData.firstName);
        submitFormData.append('lastName', formData.lastName);
        submitFormData.append('email', formData.email);
        submitFormData.append('phoneNumber', formData.phoneNumber.replace(/\s/g, ''));
        submitFormData.append('gender', formData.gender);

        if (profilePhoto) {
          submitFormData.append('profilePhoto', profilePhoto);
        }

        response = await fetch(`/api/dashboard/staff/edit?id=${selectedStaffId}`, {
          method: 'PUT',
          body: submitFormData,
        });
      }

      if (response && !response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || resData.message || 'İşlem başarısız');
      }

      await fetchStaff();
      closeModal();
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER HELPERS ---
  const filteredStaff = staffList.filter(staff =>
    staff.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStaff = staffList.length;
  const maleStaff = staffList.filter(s => s.gender === 'MALE').length;

  // Get display photo for current context
  const getDisplayPhoto = () => {
    if (profilePhotoPreview) return profilePhotoPreview;
    if (existingPhotoUrl) return existingPhotoUrl;
    return null;
  };

  return (
    <div className="p-4 md:p-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1
          className="text-3xl font-bold text-gray-800"
          style={{ fontFamily: 'Pontano Sans, sans-serif' }}
        >
          Personel Yönetim Merkezi
        </h1>
        <button
          onClick={() => openModal('ADD')}
          className="btn btn-primary bg-[#E11383] hover:bg-[#c00f6f] border-none text-white gap-2 w-full sm:w-auto rounded-md shadow-lg"
        >
          Yeni Personel Ekle
        </button>
      </div>

      {/* --- ISTATISTIK KARTLARI --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="stat bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="stat-title text-gray-500">Toplam Personel</div>
          <div className="stat-value text-gray-800 text-3xl">{totalStaff}</div>
        </div>
        <div className="stat bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="stat-title text-gray-500">Aktif Çalışan</div>
          <div className="stat-value text-gray-800 text-3xl">{totalStaff}</div>
        </div>
      </div>

      {/* --- LISTE VE ARAMA --- */}
      <div className="card bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="card-body p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Personel Listesi</h2>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Ara..."
                className="input w-full pl-10 bg-white rounded-md text-black border border-black focus:border-[#E11383] focus:outline-none placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-4 pl-6 text-gray-600 font-semibold">Personel</th>
                  <th className="py-4 text-gray-600 font-semibold">İletişim</th>
                  <th className="py-4 text-gray-600 font-semibold">Cinsiyet</th>
                  <th className="py-4 pr-6 text-center text-gray-600 font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-8"><span className="loading loading-spinner text-[#E11383]"></span></td></tr>
                ) : filteredStaff.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">Kayıt yok.</td></tr>
                ) : (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-none">
                      {/* Personel */}
                      <td className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            {staff.profilePhotoUrl ? (
                              <div className="rounded-full w-10 h-10">
                                <img src={staff.profilePhotoUrl} alt={`${staff.firstName} ${staff.lastName}`} className="object-cover" />
                              </div>
                            ) : (
                              <div className="bg-primary-50 text-text-500 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                                {staff.firstName[0]}{staff.lastName[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">{staff.firstName} {staff.lastName}</div>
                            <div className="text-xs text-gray-500">@{staff.username}</div>
                          </div>
                        </div>
                      </td>
                      {/* İletişim */}
                      <td className="py-4 text-sm">
                        <div className="text-gray-700 font-medium">{staff.phoneNumber}</div>
                        <div className="text-gray-500 text-xs">{staff.email}</div>
                      </td>
                      {/* Cinsiyet */}
                      <td className="py-4">
                        <span className="badge border-none px-3 py-2 font-medium bg-primary-50 text-text-500">
                          {staff.gender === 'MALE' ? 'Erkek' : staff.gender === 'FEMALE' ? 'Kadın' : 'Diğer'}
                        </span>
                      </td>
                      {/* İşlemler */}
                      <td className="pr-6 py-4">
                        <div className="flex justify-center items-center gap-6">
                          <button
                            onClick={() => openModal('INFO', staff)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            title="Detaylar"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openModal('EDIT', staff)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            title="Düzenle"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(staff.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Sil"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              <div className="text-center py-8"><span className="loading loading-spinner text-[#E11383]"></span></div>
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Kayıt yok.</div>
            ) : (
              filteredStaff.map((staff) => (
                <div key={staff.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="avatar placeholder">
                      {staff.profilePhotoUrl ? (
                        <div className="rounded-full w-12 h-12">
                          <img src={staff.profilePhotoUrl} alt={`${staff.firstName} ${staff.lastName}`} className="object-cover" />
                        </div>
                      ) : (
                        <div className="bg-primary-50 text-text-500 rounded-full w-12 h-12 flex items-center justify-center font-bold">
                          {staff.firstName[0]}{staff.lastName[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{staff.firstName} {staff.lastName}</div>
                      <div className="text-xs text-gray-500">@{staff.username}</div>
                    </div>
                    <span className="badge border-none px-2 py-1 text-xs font-medium bg-primary-50 text-text-500">
                      {staff.gender === 'MALE' ? 'Erkek' : staff.gender === 'FEMALE' ? 'Kadın' : 'Diğer'}
                    </span>
                  </div>

                  <div className="text-sm space-y-1 mb-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{staff.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{staff.email}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => openModal('INFO', staff)}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                      title="Detaylar"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openModal('EDIT', staff)}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                      title="Düzenle"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2"
                      title="Sil"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* --- MODAL --- */}
      {modalType && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white rounded-lg max-w-3xl w-[95%] p-0 max-h-[95vh] overflow-y-auto">

            {/* Header */}
            <div className="p-6 border-b-2 border-[#E11383]">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-xl text-gray-800">
                  {modalType === 'ADD' ? 'Yeni Personel Ekle' :
                    modalType === 'EDIT' ? 'Personel Düzenle' : 'Personel Detayı'}
                </h3>
                <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:bg-gray-100 hover:text-gray-700">✕</button>
              </div>
            </div>

            {apiError && <div className="alert alert-error text-white mx-6 mt-4 text-sm">{apiError}</div>}

            {/* --- INFO MODU --- */}
            {modalType === 'INFO' ? (
              <div className="p-6 flex flex-col items-center">
                {/* Profil Resmi */}
                {existingPhotoUrl ? (
                  <div className="w-48 h-48 rounded-full border-4 border-white shadow-lg mb-3 overflow-hidden">
                    <img src={existingPhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-full bg-pink-50 text-[#E11383] flex items-center justify-center text-6xl font-bold mb-3 border-4 border-white shadow-lg">
                    {formData.firstName[0]}{formData.lastName[0]}
                  </div>
                )}

                <h2 className="text-xl font-bold text-gray-800">{formData.firstName} {formData.lastName}</h2>
                <p className="text-gray-500 mb-6 font-medium text-sm">@{formData.username}</p>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 max-w-lg">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">E-posta Adresi</span>
                    <span className="text-gray-800 font-medium text-base truncate" title={formData.email}>{formData.email}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Telefon Numarası</span>
                    <span className="text-gray-800 font-medium text-base">{formData.phoneNumber}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Cinsiyet</span>
                    <span className="text-gray-800 font-medium text-base">
                      {formData.gender === 'MALE' ? 'Erkek' : formData.gender === 'FEMALE' ? 'Kadın' : 'Diğer'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Rol</span>
                    <span className="text-gray-800 font-medium text-base">Garson</span>
                  </div>
                </div>

                <div className="mt-8 w-full flex justify-center">
                  <button
                    onClick={closeModal}
                    className="btn btn-sm h-10 btn-outline border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 px-12 rounded-md"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : (
              /* --- ADD ve EDIT FORMU --- */
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">

                {/* Profil Fotoğrafı Bölümü */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-4">Profil Fotoğrafı</h4>
                  <div className="flex items-center gap-4">
                    {/* Photo Preview */}
                    <div className="relative">
                      {getDisplayPhoto() ? (
                        <div className="w-20 h-20 rounded-full border-[3px] border-[#E11383] overflow-hidden">
                          <img
                            src={getDisplayPhoto()!}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center border-[3px] border-[#E11383]">
                          <span className="text-2xl font-bold text-[#E11383]">
                            {formData.firstName[0] || '?'}{formData.lastName[0] || '?'}
                          </span>
                        </div>
                      )}
                      {/* Remove button */}
                      {(profilePhoto || existingPhotoUrl) && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          title="Fotoğrafı kaldır"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="profilePhotoInput"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-sm bg-[#E11383] hover:bg-[#d11279] text-white border-none rounded-md px-4"
                      >
                        {profilePhoto || existingPhotoUrl ? 'Fotoğrafı Değiştir' : 'Dosya Seç'}
                      </button>
                      <p className="text-xs text-[#E11383] mt-1">JPG, PNG veya GIF (MAX. 2MB)</p>
                      {errors.profilePhoto && <p className="text-error text-xs mt-1">{errors.profilePhoto}</p>}
                    </div>
                  </div>
                </div>

                {/* Kişisel Bilgiler Bölümü */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-4">Kişisel Bilgiler</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">İsim</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="örn. Ahmet"
                        className="input input-bordered w-full bg-white rounded-md text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none"
                      />
                      {errors.firstName && <span className="text-error text-xs">{errors.firstName}</span>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">Soyisim</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="örn. Yılmaz"
                        className="input input-bordered w-full bg-white rounded-md text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none"
                      />
                      {errors.lastName && <span className="text-error text-xs">{errors.lastName}</span>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">Cinsiyet</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="select select-bordered w-full bg-white rounded-md text-gray-900 focus:border-[#E11383] focus:outline-none"
                      >
                        <option value="" disabled>Cinsiyet seçiniz</option>
                        <option value="MALE">Erkek</option>
                        <option value="FEMALE">Kadın</option>
                        <option value="OTHER">Diğer</option>
                      </select>
                      {errors.gender && <span className="text-error text-xs">{errors.gender}</span>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">Kullanıcı Adı</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        disabled={modalType === 'EDIT'}
                        placeholder="örn. ahmetyilmaz"
                        className="input input-bordered w-full bg-white rounded-md text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                      />
                      {errors.username && <span className="text-error text-xs">{errors.username}</span>}
                    </div>
                  </div>
                </div>

                {/* İletişim Bilgileri Bölümü */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-4">İletişim Bilgileri</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">Telefon Numarası</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="0555 123 45 67"
                        className="input input-bordered w-full bg-white rounded-md text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none"
                      />
                      {errors.phoneNumber && <span className="text-error text-xs">{errors.phoneNumber}</span>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">E-posta Adresi</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="ornek@email.com"
                        className="input input-bordered w-full bg-white rounded-md text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none"
                      />
                      {errors.email && <span className="text-error text-xs">{errors.email}</span>}
                    </div>
                  </div>
                </div>

                {/* Güvenlik Bölümü - Sadece ADD modunda */}
                {modalType === 'ADD' && (
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-4">Güvenlik</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Şifre</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="input input-bordered w-full bg-white rounded-md text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none"
                        />
                        {errors.password && <span className="text-error text-xs">{errors.password}</span>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Şifre Tekrar</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="input input-bordered w-full bg-white rounded-md text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none"
                        />
                        {errors.confirmPassword && <span className="text-error text-xs">{errors.confirmPassword}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Butonlar */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn bg-white border-2 border-[#E11383] text-[#E11383] hover:bg-pink-50 hover:border-[#E11383] rounded-md px-6"
                  >
                    İptal
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn bg-[#E11383] hover:bg-[#d11279] text-white border-none rounded-md px-6"
                  >
                    {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : (modalType === 'EDIT' ? 'Güncelle' : '✓ Personeli Kaydet')}
                  </button>
                </div>
              </form>
            )}
          </div>
          <form method="dialog" className="modal-backdrop bg-black/30">
            <button onClick={closeModal}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}