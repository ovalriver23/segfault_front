'use client';

import Link from 'next/link';
import { usePageTitle } from '../layout';
import { useEffect } from 'react';

export default function SettingsPage() {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle('Ayarlar');
  }, [setPageTitle]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-500 mb-2">Ayarlar</h1>
        <p className="text-text-300">Hesap ayarlarınızı yönetin</p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Security Settings Card */}
        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-primary-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="card-title text-text-500 text-lg mb-2">Güvenlik</h2>
                <p className="text-text-300 text-sm mb-4">
                    Hesabınız için güvenlik ayarları
                </p>
                <Link href="/dashboard/settings/change-password">
                  <button className="btn btn-primary bg-primary-500 hover:bg-primary-600 border-none text-white">
                    Şifre Değiştir
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings Card - Placeholder for future */}
        <div className="card bg-white shadow-lg opacity-60 cursor-not-allowed">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-gray-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="card-title text-text-500 text-lg mb-2">
                  Profil Bilgileri
                  <span className="badge badge-sm badge-ghost ml-2">Yakında</span>
                </h2>
                <p className="text-text-300 text-sm mb-4">
                  Profil bilgilerinizi ve restoran ayarlarınızı düzenleyin
                </p>
                <button className="btn btn-disabled" disabled>
                  Profil Düzenle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Theme Settings Card - Placeholder for future */}
        <div className="card bg-white shadow-lg opacity-60 cursor-not-allowed">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-gray-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" 
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="card-title text-text-500 text-lg mb-2">
                  Menü Teması
                  <span className="badge badge-sm badge-ghost ml-2">Yakında</span>
                </h2>
                <p className="text-text-300 text-sm mb-4">
                  Menü görünümünü ve temasını özelleştirin
                </p>
                <button className="btn btn-disabled" disabled>
                  Temayı Düzenle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Settings Card - Placeholder for future */}
        <div className="card bg-white shadow-lg opacity-60 cursor-not-allowed">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-gray-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="card-title text-text-500 text-lg mb-2">
                  Restoran Ayarları
                  <span className="badge badge-sm badge-ghost ml-2">Yakında</span>
                </h2>
                <p className="text-text-300 text-sm mb-4">
                  Restoran bilgilerinizi ve işletme ayarlarınızı düzenleyin
                </p>
                <button className="btn btn-disabled" disabled>
                  Restoran Düzenle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}