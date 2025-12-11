'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { z } from 'zod';

/**
 * Backend StaffResponse yapısına uygun arayüz
 */
interface Staff {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  role?: string; 
  createdAt?: string;
}

/**
 * Zod Şeması - DÜZELTİLDİ
 * Karmaşık yapı yerine çalışan basit ve güvenli yapı kullanıldı.
 */
const staffSchema = z.object({
  firstName: z.string().min(2, 'İsim en az 2 karakter').max(50),
  lastName: z.string().min(2, 'Soyisim en az 2 karakter').max(50),
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter').max(20),
  email: z.string().email('Geçerli email giriniz'),
  phoneNumber: z.string()
    .transform(v => v.replace(/\s/g, ''))
    .pipe(z.string().regex(/^[0-9]{10,11}$/, 'Telefon numarası 10-11 haneli ve rakam olmalıdır')),
  password: z.string()
    .min(8, 'Şifre en az 8 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/, 'Şifre en az 1 büyük, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir'),
  // DÜZELTME: z.enum kullanımı basitleştirildi. Hata mesajı parametresi kaldırıldı.
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'])
});

export default function StaffPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard/staff/get', { cache: 'no-store' });
      if (!response.ok) {
        // Eğer 401 hatası alırsak ve backend yoksa, boş liste dön veya hata fırlat
        if (response.status === 401) {
            console.warn("Oturum süresi dolmuş veya giriş yapılmamış.");
        }
        const err = await response.json().catch(() => ({}));
        console.error('Liste hatası:', err);
        throw new Error('Veri alınamadı');
      }
      const data = await response.json();
      setStaffList(data);
    } catch (error) {
      console.error('Fetch error:', error);
      // Hata durumunda listeyi boşaltabiliriz veya eski veriyi tutabiliriz
    } finally {
      setIsLoading(false);
    }
  };

  const totalStaff = staffList.length;
  const maleStaff = staffList.filter(s => s.gender === 'MALE').length;

  const filteredStaff = staffList.filter(staff =>
    staff.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      staffSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
      }
    }
    
    // Şifre eşleşme kontrolü - Zod'dan bağımsız olarak her zaman kontrol edilir
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor!';
    }
    
    // Şifre tekrar boş mu kontrolü
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı zorunludur';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/dashboard/staff/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phoneNumber: formData.phoneNumber.replace(/\s/g, '')
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error || 'Hata oluştu');

      await fetchStaff();
      alert('Personel eklendi!');
      handleCloseModal();
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    if(!confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      const response = await fetch(`/api/dashboard/staff/delete?id=${staffId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Silinemedi');
      fetchStaff();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      username: '', firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', gender: 'MALE',
    });
    setErrors({});
    setApiError(null);
  };

  const handleInfoClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsInfoModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Pontano Sans, sans-serif' }}>
          Personel Yönetim Merkezi
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary bg-[#E11383] hover:bg-[#c00f6f] border-none text-white gap-2 w-full sm:w-auto rounded-xl shadow-lg"
        >
          Yeni Personel Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="stat bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
          <div className="stat-title text-gray-500">Toplam Personel</div>
          <div className="stat-value text-gray-800 text-3xl">{totalStaff}</div>
        </div>
        <div className="stat bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
          <div className="stat-title text-gray-500">Erkek / Kadın</div>
          <div className="stat-value text-gray-800 text-3xl">{maleStaff} / {totalStaff - maleStaff}</div>
        </div>
      </div>

      <div className="card bg-white shadow-sm border border-gray-100 rounded-3xl">
        <div className="card-body p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Personel Listesi</h2>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Ara..."
                className="input input-bordered w-full pl-10 bg-gray-50 rounded-xl focus:border-[#E11383] focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-4 pl-6 text-gray-600 font-semibold">Personel</th>
                  <th className="py-4 text-gray-600 font-semibold">İletişim</th>
                  <th className="py-4 text-gray-600 font-semibold">Cinsiyet</th>
                  <th className="py-4 pr-6 text-right text-gray-600 font-semibold">İşlemler</th>
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
                      <td className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-[#fde6d1] text-[#683817] rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {staff.firstName[0]}{staff.lastName[0]}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">{staff.firstName} {staff.lastName}</div>
                            <div className="text-xs text-gray-500">@{staff.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm">
                        <div>{staff.phoneNumber}</div>
                        <div className="text-gray-500 text-xs">{staff.email}</div>
                      </td>
                      <td className="py-4">
                        <span className={`badge border-none py-3 px-4 ${staff.gender === 'MALE' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                            {staff.gender === 'MALE' ? 'Erkek' : staff.gender === 'FEMALE' ? 'Kadın' : 'Diğer'}
                        </span>
                      </td>
                      <td className="pr-6 py-4 text-right">
                        <button onClick={() => handleDeleteStaff(staff.id)} className="btn btn-sm btn-ghost text-red-500">Sil</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL KISIMLARI */}
      {isModalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white rounded-2xl max-w-3xl w-[95%] p-0 max-h-[95vh] overflow-y-auto">
            {/* Header - Pembe çizgi eklendi */}
            <div className="p-6 border-b-2 border-[#E11383]">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-xl text-gray-800">Yeni Personel Ekle</h3>
                <button onClick={handleCloseModal} className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:bg-gray-100 hover:text-gray-700">✕</button>
              </div>
            </div>
            
            {apiError && <div className="alert alert-error text-white mx-6 mt-4 text-sm">{apiError}</div>}
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
              
              {/* Profil Fotoğrafı Bölümü */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h4 className="font-semibold text-gray-700 mb-4">Profil Fotoğrafı</h4>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center border-[3px] border-[#E11383]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#E11383]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
                    </svg>
                  </div>
                  <div>
                    <button type="button" className="btn btn-sm bg-[#E11383] hover:bg-[#d11279] text-white border-none rounded-lg px-4">
                      Dosya Seç
                    </button>
                    <p className="text-xs text-[#E11383] mt-1">JPG, PNG veya GIF (MAX. 2MB)</p>
                  </div>
                </div>
              </div>

              {/* Kişisel Bilgiler Bölümü */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
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
                      className="input input-bordered w-full bg-white rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none" 
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
                      className="input input-bordered w-full bg-white rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none" 
                    />
                    {errors.lastName && <span className="text-error text-xs">{errors.lastName}</span>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 block">Cinsiyet</label>
                    <select 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleInputChange} 
                      className="select select-bordered w-full bg-white rounded-lg text-gray-900 focus:border-[#E11383] focus:outline-none"
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
                      placeholder="örn. ahmetyilmaz"
                      className="input input-bordered w-full bg-white rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none" 
                    />
                    {errors.username && <span className="text-error text-xs">{errors.username}</span>}
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri Bölümü */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
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
                      className="input input-bordered w-full bg-white rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none" 
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
                      className="input input-bordered w-full bg-white rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none" 
                    />
                    {errors.email && <span className="text-error text-xs">{errors.email}</span>}
                  </div>
                </div>
              </div>

              {/* Güvenlik Bölümü */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
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
                      className="input input-bordered w-full bg-white rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none" 
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
                      className="input input-bordered w-full bg-white rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-[#E11383] focus:outline-none" 
                    />
                    {errors.confirmPassword && <span className="text-error text-xs">{errors.confirmPassword}</span>}
                  </div>
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="btn bg-white border-2 border-[#E11383] text-[#E11383] hover:bg-pink-50 hover:border-[#E11383] rounded-lg px-6"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn bg-[#E11383] hover:bg-[#d11279] text-white border-none rounded-lg px-6"
                >
                  {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : '✓ Personeli Kaydet'}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop bg-black/30">
            <button onClick={handleCloseModal}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}