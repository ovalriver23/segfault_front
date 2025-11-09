'use client';

import { useState } from 'react';

/**
 * Staff interface - Represents a staff member
 */
interface Staff {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: string;
  gender?: string;
  createdAt: string;
  avatar?: string;
}

/**
 * StaffPage Component
 * Manages staff members with CRUD operations, authentication, and search functionality
 */
export default function StaffPage() {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  
  // Password verification modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordAction, setPasswordAction] = useState<'edit' | 'delete' | null>(null);
  const [pendingStaff, setPendingStaff] = useState<Staff | null>(null);
  const [verificationPassword, setVerificationPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    gender: '',
    avatar: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Calculate statistics
  const totalStaff = staffList.length;
  const currentWorkingStaff = staffList.filter(staff => staff.role !== 'Inactive').length;

  // Filter staff based on search query
  const filteredStaff = staffList.filter(staff =>
    staff.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Handles form input changes and clears related errors
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Handles file upload for avatar
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, avatar: e.target.files![0] }));
      if (errors.avatar) {
        setErrors(prev => ({ ...prev, avatar: '' }));
      }
    }
  };

  /**
   * Validates form data before submission
   * @returns boolean - true if form is valid
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    // Phone validation
    const phoneRegex = /^\d{10,}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz (en az 10 rakam)';
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Lütfen cinsiyet seçiniz';
    }

    // Password validation
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Lütfen bir rol seçiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission for both adding and editing staff
   * @param e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isEditMode && editingStaffId) {
        // Edit mode - update existing staff
        const updatedStaff: Staff = {
          id: editingStaffId,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          role: formData.role,
          createdAt: staffList.find(s => s.id === editingStaffId)?.createdAt || new Date().toISOString().split('T')[0],
        };

        setStaffList(prev => prev.map(staff => 
          staff.id === editingStaffId ? updatedStaff : staff
        ));
      } else {
        // Add mode - create new staff
        const newStaff: Staff = {
          id: staffList.length + 1,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          role: formData.role,
          createdAt: new Date().toISOString().split('T')[0],
        };

        setStaffList(prev => [...prev, newStaff]);
      }

      // Reset form and close modal
      setFormData({ username: '', email: '', phone: '', password: '', confirmPassword: '', role: '', gender: '', avatar: null });
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingStaffId(null);
      setErrors({});
    } catch (error) {
      console.error('Personel eklenirken hata:', error);
      setErrors({ submit: 'Personel eklenirken bir hata oluştu' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Opens password verification modal for editing staff
   * @param staff - Staff member to edit
   */
  const handleEditStaff = (staff: Staff) => {
    setPendingStaff(staff);
    setPasswordAction('edit');
    setIsPasswordModalOpen(true);
  };

  /**
   * Opens password verification modal for deleting staff
   * @param staff - Staff member to delete
   */
  const handleDeleteStaff = (staff: Staff) => {
    setPendingStaff(staff);
    setPasswordAction('delete');
    setIsPasswordModalOpen(true);
  };

  /**
   * Verifies admin password before allowing edit or delete operations
   * Provides security layer to prevent accidental modifications
   */
  const handlePasswordVerification = async () => {
    if (!verificationPassword) {
      setPasswordError('Lütfen şifrenizi girin');
      return;
    }

    // TODO: Replace with actual API password verification
    // Currently accepts any password for demo purposes
    const isPasswordCorrect = true; // await verifyPassword(verificationPassword);

    if (!isPasswordCorrect) {
      setPasswordError('Şifre yanlış. Lütfen tekrar deneyin.');
      return;
    }

    // Password verified - proceed with action
    if (passwordAction === 'edit' && pendingStaff) {
      // Open edit modal with staff data pre-filled
      setIsEditMode(true);
      setEditingStaffId(pendingStaff.id);
      setFormData({
        username: pendingStaff.username,
        email: pendingStaff.email,
        phone: pendingStaff.phone || '',
        password: '',
        confirmPassword: '',
        role: pendingStaff.role,
        gender: pendingStaff.gender || '',
        avatar: null,
      });
      setIsModalOpen(true);
    } else if (passwordAction === 'delete' && pendingStaff) {
      // Delete staff member
      try {
        // TODO: Replace with actual API call
        setStaffList(prev => prev.filter(staff => staff.id !== pendingStaff.id));
      } catch (error) {
        console.error('Personel silinirken hata:', error);
      }
    }

    // Close modal and reset states
    setIsPasswordModalOpen(false);
    setVerificationPassword('');
    setPasswordError('');
    setPasswordAction(null);
    setPendingStaff(null);
  };

  /**
   * Opens info modal to display staff details
   * @param staff - Staff member to view
   */
  const handleInfoClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsInfoModalOpen(true);
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Pontano Sans, sans-serif' }}>
          Personel Yönetim Merkezi
        </h1>
        <button
          onClick={() => {
            setIsEditMode(false);
            setEditingStaffId(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary bg-orange-500 hover:bg-orange-600 border-none text-white gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Yeni Personel Ekle
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-8 bg-white border border-gray-200">
        <div className="stat">
          <div className="stat-title text-gray-500">Çalışan Personel</div>
          <div className="stat-value text-gray-800">{currentWorkingStaff}</div>
          <div className="stat-desc text-gray-400">Aktif çalışanlar</div>
        </div>

        <div className="stat">
          <div className="stat-title text-gray-500">Toplam Personel</div>
          <div className="stat-value text-gray-800">{totalStaff}</div>
          <div className="stat-desc text-gray-400">Tüm ekip üyeleri</div>
        </div>
      </div>

      {/* All Staff Section */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Tüm Personeller</h2>
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Personel ara..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 bg-white text-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto">
            <table className="table w-full table-fixed">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-gray-600 font-semibold text-sm uppercase w-[40%]">Personel Adı</th>
                  <th className="text-gray-600 font-semibold text-sm uppercase w-[20%]">Rol</th>
                  <th className="text-gray-600 font-semibold text-sm uppercase w-[20%]">Eklenme Tarihi</th>
                  <th className="text-gray-600 font-semibold text-sm uppercase w-[20%]">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {/* Empty state */}
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-600 mb-2">Henüz personel yok</p>
                        <p className="text-sm text-gray-400">İlk ekip üyenizi eklemek için "Yeni Personel Ekle" butonuna tıklayın</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* Staff rows */
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50 border-b border-gray-100">
                      <td>
                        <div className="flex items-center gap-3">
                          {/* Avatar with fallback to SVG icon */}
                          <div className="avatar placeholder">
                            <div className="bg-gray-200 text-gray-600 rounded-full w-12 h-12 flex items-center justify-center">
                              {staff.avatar ? (
                                <img src={staff.avatar} alt={staff.username} className="rounded-full w-12 h-12 object-cover" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="font-semibold text-gray-800">{staff.username}</span>
                        </div>
                      </td>
                      <td className="text-gray-600">{staff.role}</td>
                      <td className="text-gray-600">{staff.createdAt}</td>
                      <td>
                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleInfoClick(staff)}
                            className="btn btn-ghost btn-sm text-gray-800 hover:bg-orange-100 hover:text-gray-800 border-0"
                            title="Detaylı Bilgi"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleEditStaff(staff)}
                            className="btn btn-ghost btn-sm text-gray-800 hover:bg-orange-100 hover:text-gray-800 border-0"
                            title="Düzenle"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(staff)}
                            className="btn btn-ghost btn-sm text-gray-800 hover:bg-orange-100 hover:text-gray-800 border-0"
                            title="Sil"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
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
        </div>
      </div>

      {/* Info Modal - Staff Details */}
      {isInfoModalOpen && selectedStaff && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl bg-white">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-2xl text-gray-800">Personel Detayları</h3>
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost text-gray-600 hover:bg-orange-100 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Staff profile header */}
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <div className="avatar placeholder">
                  <div className="bg-orange-100 text-orange-600 rounded-full w-20 h-20 flex items-center justify-center">
                    {selectedStaff.avatar ? (
                      <img src={selectedStaff.avatar} alt={selectedStaff.username} className="rounded-full w-20 h-20 object-cover" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedStaff.username}</h4>
                  <p className="text-gray-500">{selectedStaff.role}</p>
                </div>
              </div>

              {/* Staff details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">Personel ID</label>
                  <p className="text-gray-800 font-medium mt-1">#{selectedStaff.id}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">E-posta Adresi</label>
                  <p className="text-gray-800 font-medium mt-1">{selectedStaff.email}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">Telefon</label>
                  <p className="text-gray-800 font-medium mt-1">{selectedStaff.phone || 'Belirtilmemiş'}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">Cinsiyet</label>
                  <p className="text-gray-800 font-medium mt-1">{selectedStaff.gender || 'Belirtilmemiş'}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">Rol</label>
                  <p className="text-gray-800 font-medium mt-1">{selectedStaff.role}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">Eklenme Tarihi</label>
                  <p className="text-gray-800 font-medium mt-1">{selectedStaff.createdAt}</p>
                </div>
              </div>

              {/* Additional information section */}
              <div className="pt-4 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-500 uppercase mb-3">Ek Bilgiler</h5>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Personel hesabı aktif durumda. Tüm yetkilere ve menü erişimine sahiptir.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="btn btn-ghost"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Verification Modal */}
      {isPasswordModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-xl text-gray-800">
                {passwordAction === 'delete' ? 'Silme İşlemini Onayla' : 'Düzenleme İşlemini Onayla'}
              </h3>
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setVerificationPassword('');
                  setPasswordError('');
                  setPasswordAction(null);
                  setPendingStaff(null);
                }}
                className="btn btn-sm btn-circle btn-ghost text-gray-600 hover:bg-orange-100 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                {passwordAction === 'delete' 
                  ? 'Bu personeli silmek için lütfen şifrenizi girin.' 
                  : 'Personel bilgilerini düzenlemek için lütfen şifrenizi girin.'}
              </p>

              {/* Display staff info being acted upon */}
              {pendingStaff && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Personel:</span> {pendingStaff.username}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">E-posta:</span> {pendingStaff.email}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifreniz
                </label>
                <input
                  type="password"
                  value={verificationPassword}
                  onChange={(e) => {
                    setVerificationPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Şifrenizi girin"
                  className="input input-bordered w-full bg-gray-50 text-gray-800"
                  style={{ 
                    borderColor: passwordError ? '#EF4444' : '#E5E7EB',
                    color: '#1f2937'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordVerification();
                    }
                  }}
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setVerificationPassword('');
                  setPasswordError('');
                  setPasswordAction(null);
                  setPendingStaff(null);
                }}
                className="btn btn-ghost"
              >
                İptal
              </button>
              <button
                onClick={handlePasswordVerification}
                className="btn text-white"
                style={{ 
                  backgroundColor: passwordAction === 'delete' ? '#EF4444' : '#F97316',
                  borderColor: passwordAction === 'delete' ? '#EF4444' : '#F97316'
                }}
              >
                {passwordAction === 'delete' ? 'Sil' : 'Düzenle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl" style={{ backgroundColor: '#F5F5F5' }}>
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-4" style={{ borderBottom: '2px solid #E11383' }}>
              <h3 className="font-bold text-2xl text-gray-800">
                {isEditMode ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setEditingStaffId(null);
                  setFormData({ username: '', email: '', phone: '', password: '', confirmPassword: '', role: '', gender: '', avatar: null });
                  setErrors({});
                }}
                className="btn btn-sm btn-circle btn-ghost hover:bg-pink-100"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Profile Photo Upload Section */}
              <div className="mb-6">
                <div className="bg-white rounded-lg p-6" style={{ border: '2px solid #E11383' }}>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Profil Fotoğrafı</h4>
                  <div className="flex items-center gap-6">
                    {/* Avatar preview */}
                    <div className="avatar placeholder">
                      <div 
                        className="w-24 h-24 rounded-full flex items-center justify-center" 
                        style={{ 
                          backgroundColor: '#FCE7F3', 
                          color: '#E11383',
                          boxShadow: '0 0 0 4px #E11383'
                        }}
                      >
                        {formData.avatar ? (
                          // Checkmark when file is selected
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          // Default user icon
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    {/* File upload button */}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        id="avatar-upload"
                        className="hidden"
                      />
                      <div className="mt-2">
                        <label 
                          htmlFor="avatar-upload"
                          className="inline-block px-4 py-2 rounded-lg cursor-pointer text-sm font-medium hover:opacity-80 transition-opacity"
                          style={{ 
                            backgroundColor: '#E11383',
                            color: '#ffffffff'
                          }}
                        >
                          Dosya Seç
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">JPG, PNG veya GIF (MAX. 2MB)</p>
                      {formData.avatar && (
                        <p className="text-sm font-medium mt-2" style={{ color: '#E11383' }}>✓ {formData.avatar.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Kişisel Bilgiler */}
              <div className="mb-6">
                <div className="bg-white rounded-lg p-6" style={{ border: '2px solid #E11383' }}>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Kişisel Bilgiler</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* İsim Soyisim */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-gray-700">İsim Soyisim</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        placeholder="örn. Ahmet Yılmaz"
                        className="input input-bordered w-full bg-gray-50 text-gray-800"
                        style={{ 
                          borderColor: errors.username ? '#ef4444' : '#d1d5db',
                          borderWidth: '2px',
                          color: '#1f2937'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E11383'}
                        onBlur={(e) => e.target.style.borderColor = errors.username ? '#ef4444' : '#d1d5db'}
                        value={formData.username}
                        onChange={handleInputChange}
                      />
                      {errors.username && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.username}</span>
                        </label>
                      )}
                    </div>

                    {/* Cinsiyet */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-gray-700">Cinsiyet</span>
                      </label>
                      <select
                        name="gender"
                        className="select select-bordered w-full bg-gray-50 text-gray-800"
                        style={{ 
                          borderColor: errors.gender ? '#ef4444' : '#d1d5db',
                          borderWidth: '2px',
                          color: '#1f2937'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E11383'}
                        onBlur={(e) => e.target.style.borderColor = errors.gender ? '#ef4444' : '#d1d5db'}
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Cinsiyet seçiniz</option>
                        <option value="Erkek">Erkek</option>
                        <option value="Kadın">Kadın</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                      {errors.gender && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.gender}</span>
                        </label>
                      )}
                    </div>

                    {/* Rol */}
                    <div className="form-control md:col-span-2">
                      <label className="label">
                        <span className="label-text font-medium text-gray-700">Rol</span>
                      </label>
                      <select
                        name="role"
                        className="select select-bordered w-full bg-gray-50 text-gray-800"
                        style={{ 
                          borderColor: errors.role ? '#ef4444' : '#d1d5db',
                          borderWidth: '2px',
                          color: '#1f2937'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E11383'}
                        onBlur={(e) => e.target.style.borderColor = errors.role ? '#ef4444' : '#d1d5db'}
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="">Rol seçiniz</option>
                        <option value="Müdür">Müdür</option>
                        <option value="Aşçı">Aşçı</option>
                        <option value="Garson">Garson</option>
                        <option value="Barista">Barista</option>
                        <option value="Kasiyer">Kasiyer</option>
                      </select>
                      {errors.role && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.role}</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="mb-6">
                <div className="bg-white rounded-lg p-6" style={{ border: '2px solid #E11383' }}>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">İletişim Bilgileri</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Telefon */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-gray-700">Telefon Numarası</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="0555 123 45 67"
                        className="input input-bordered w-full bg-gray-50 text-gray-800"
                        style={{ 
                          borderColor: errors.phone ? '#ef4444' : '#d1d5db',
                          borderWidth: '2px',
                          color: '#1f2937'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E11383'}
                        onBlur={(e) => e.target.style.borderColor = errors.phone ? '#ef4444' : '#d1d5db'}
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                      {errors.phone && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.phone}</span>
                        </label>
                      )}
                    </div>

                    {/* E-posta */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-gray-700">E-posta Adresi</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="ornek@email.com"
                        className="input input-bordered w-full bg-gray-50 text-gray-800"
                        style={{ 
                          borderColor: errors.email ? '#ef4444' : '#d1d5db',
                          borderWidth: '2px',
                          color: '#1f2937'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E11383'}
                        onBlur={(e) => e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db'}
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      {errors.email && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.email}</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Güvenlik */}
              <div className="mb-6">
                <div className="bg-white rounded-lg p-6" style={{ border: '2px solid #E11383' }}>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Güvenlik</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Şifre */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-gray-700">Şifre</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        className="input input-bordered w-full bg-gray-50 text-gray-800"
                        style={{ 
                          borderColor: errors.password ? '#ef4444' : '#d1d5db',
                          borderWidth: '2px',
                          color: '#1f2937'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E11383'}
                        onBlur={(e) => e.target.style.borderColor = errors.password ? '#ef4444' : '#d1d5db'}
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      {errors.password && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.password}</span>
                        </label>
                      )}
                    </div>

                    {/* Şifre Tekrar */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-gray-700">Şifre Tekrar</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        className="input input-bordered w-full bg-gray-50 text-gray-800"
                        style={{ 
                          borderColor: errors.confirmPassword ? '#ef4444' : '#d1d5db',
                          borderWidth: '2px',
                          color: '#1f2937'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E11383'}
                        onBlur={(e) => e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#d1d5db'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                      {errors.confirmPassword && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.confirmPassword}</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="alert alert-error mb-4">
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Modal Butonları */}
              <div className="modal-action justify-end gap-3">
                <button
                  type="button"
                  className="btn bg-white hover:bg-pink-50"
                  style={{ 
                    borderColor: '#E11383',
                    borderWidth: '2px',
                    color: '#E11383'
                  }}
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({ username: '', email: '', phone: '', password: '', confirmPassword: '', role: '', gender: '', avatar: null });
                    setErrors({});
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn border-none text-white hover:opacity-90"
                  style={{ 
                    backgroundColor: '#E11383'
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Kaydediliyor...' : '✓ Personeli Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
