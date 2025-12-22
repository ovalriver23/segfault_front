'use client';

import { User, LogOut, Lock, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  role: string;
  hasRestaurant: boolean;
}

export default function WaiterProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Profil bilgileri yüklenemedi');
      }

      const data = await response.json();
      setProfile(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        router.push('/waiter/login');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleChangePassword = () => {
    router.push('/waiter/change-password');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#FF9F5A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-600 mb-4">{error || 'Profil yüklenemedi'}</p>
          <button 
            onClick={fetchProfile}
            className="px-6 py-2.5 bg-[#FF9F5A] text-white rounded-xl font-medium hover:bg-[#e88d48] transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-linear-to-br from-[#FF9F5A] to-[#e88d48] px-6 pt-6 pb-16">
        <h1 className="text-2xl font-semibold text-white mb-4">Profil</h1>
        
        {/* Profile Avatar & Name */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 ring-4 ring-white/30">
            <User className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{profile.username}</h2>
          <p className="text-white/80 text-sm font-medium">Garson</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 -mt-8">
        {/* Account Info Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Hesap Bilgileri
          </h3>
          
          <div className="space-y-4">
            {/* Username */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Kullanıcı Adı</p>
                <p className="text-base font-medium text-gray-900">{profile.username}</p>
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            {/* Email */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">E-posta</p>
                <p className="text-base font-medium text-gray-900">
                  {profile.email || 'Belirtilmemiş'}
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            {/* Role */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Rol</p>
                <p className="text-base font-medium text-gray-900">
                  {profile.role === 'STAFF' ? 'Garson' : profile.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-6">
          {/* Change Password */}
          <button
            onClick={handleChangePassword}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#FF9F5A]" strokeWidth={2} />
              </div>
              <div className="text-left">
                <p className="text-base font-medium text-gray-900">Şifre Değiştir</p>
                <p className="text-xs text-gray-500">Hesap güvenliğinizi koruyun</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>

          <div className="h-px bg-gray-100 mx-4"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-xl transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-500" strokeWidth={2} />
              </div>
              <div className="text-left">
                <p className="text-base font-medium text-red-600">Çıkış Yap</p>
                <p className="text-xs text-red-400">Hesabınızdan çıkış yapın</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}