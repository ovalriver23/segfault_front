'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ChangePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isForced = searchParams.get('reason') === 'forced';

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      setError('Yeni şifre eskisiyle aynı olamaz.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Hata oluştu');
      }

      setSuccess('Şifreniz başarıyla değiştirildi. Yönlendiriliyorsunuz...');
      
      // Başarılı işlem sonrası masalara geri dön
      setTimeout(() => {
        router.push('/waiter/tables');
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[393px] min-h-screen mx-auto bg-white overflow-hidden rounded-[30px] flex flex-col justify-center px-8">
      
      {/* Icon */}
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#F8A45A]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>

      <h1 className="text-[28px] font-semibold text-center text-black mb-2" style={{ fontFamily: 'Pontano Sans, sans-serif' }}>
        Şifre Değişikliği
      </h1>
      
      {isForced && (
        <p className="text-center text-gray-500 text-sm mb-8 px-4">
          Güvenliğiniz için lütfen yöneticinizden aldığınız geçici şifreyi değiştiriniz.
        </p>
      )}

      {error && <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4 text-center">{success}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Current Password */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Mevcut (Geçici) Şifre</label>
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-3 bg-white border border-[#F8A45A] rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F8A45A]/20 transition-all"
            placeholder="Mevcut şifreniz"
            value={formData.currentPassword}
            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
            required
          />
        </div>

        {/* New Password */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Yeni Şifre</label>
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-3 bg-white border border-[#F8A45A] rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F8A45A]/20 transition-all"
            placeholder="Yeni şifreniz"
            value={formData.newPassword}
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Yeni Şifre Tekrar</label>
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-3 bg-white border border-[#F8A45A] rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F8A45A]/20 transition-all"
            placeholder="Yeni şifreniz (tekrar)"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            required
          />
        </div>

        {/* Show Password Toggle */}
        <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
          <div className={`w-4 h-4 rounded border flex items-center justify-center ${showPassword ? 'bg-[#EB5FAB] border-[#EB5FAB]' : 'border-gray-400'}`}>
            {showPassword && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="text-xs text-gray-600">Şifreleri Göster</span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#EB5FAB] rounded-xl shadow-lg shadow-[#EB5FAB]/20 flex items-center justify-center mt-2 hover:bg-[#d54f9a] transition-all disabled:opacity-70 active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm text-white"></span>
          ) : (
            <span className="text-sm font-bold text-white">Şifreyi Güncelle</span>
          )}
        </button>
      </form>
    </div>
  );
}