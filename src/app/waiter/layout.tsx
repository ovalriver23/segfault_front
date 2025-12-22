'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function WaiterLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  // Check if current page is login page or change password page (only if forced)
  const isForced = searchParams.get('reason') === 'forced';
  const shouldHideNavbar = pathname === '/waiter/login' || (pathname === '/waiter/change-password' && isForced);

  useEffect(() => {
    // Skip auth check for login page
    if (isLoginPage) {
      setIsAuthorized(true);
      setLoading(false);
      return;
    }

    // Check user role
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          router.replace('/waiter/login');
          return;
        }

        const user = await response.json();
        
        if (user.role !== 'STAFF') {
          // Manager trying to access waiter pages -> show error
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        router.replace('/waiter/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isLoginPage, router]);

  // Show loading spinner while checking auth (except for login page)
  if (!isLoginPage && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#683817]"></div>
      </div>
    );
  }

  // Show access denied error for managers trying to access waiter pages
  if (!isLoginPage && !isAuthorized && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600 mb-6">Bu sayfaya erişim yetkiniz bulunmamaktadır. Garson paneline sadece <span className="font-semibold">Staff</span> rolündeki kullanıcılar erişebilir.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#683817] hover:bg-[#4a2810] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Yönetici Paneline Git
          </button>
        </div>
      </div>
    );
  }

  // Aktif ikon rengini belirlemek için yardımcı fonksiyon
  const isActive = (path: string) => pathname === path ? "text-[#683817]" : "text-[#b09886]";

  return (
    <div className={`min-h-screen bg-white font-sans ${!shouldHideNavbar ? 'pb-20' : ''}`}>
      {/* Ana İçerik */}
      <main className="max-w-md mx-auto min-h-screen bg-white">
        {children}
      </main>

      {/* Bottom Navigation Bar - Hidden on login and change password pages */}
      {!shouldHideNavbar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-4 pt-3 px-6 z-50">
          <div className="max-w-md mx-auto flex justify-between items-center">
            
            {/* Masalar Butonu */}
            <Link href="/waiter/tables" className="flex flex-col items-center gap-1">
              <svg 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={isActive('/waiter/tables')}
              >
                <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                {/* Aktiflik Çizgisi */}
                {pathname === '/waiter/tables' && <rect x="3" y="10" width="18" height="2" fill="#683817" className="mt-1" />} 
              </svg>
              {pathname === '/waiter/tables' && (
                 <div className="w-12 h-1 bg-text-500 rounded-full mt-1"></div>
              )}
            </Link>

            {/* Bildirimler Butonu */}
            <Link href="/waiter/notifications" className="flex flex-col items-center gap-1">
              <svg 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={isActive('/waiter/notifications')}
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                <line x1="12" y1="3" x2="12" y2="21" strokeWidth="0"></line> 
                <path d="M12 3v3" strokeWidth="2"/>
              </svg>
               {pathname === '/waiter/notifications' && (
                 <div className="w-12 h-1 bg-text-500rounded-full mt-1"></div>
              )}
            </Link>

            {/* Profil Butonu - ARTIK TIKLANABİLİR */}
            <Link href="/waiter/profile" className="flex flex-col items-center gap-1">
              <svg 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={isActive('/waiter/profile')}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {pathname === '/waiter/profile' && (
                 <div className="w-12 h-1 bg-text-500 rounded-full mt-1"></div>
              )}
            </Link>

          </div>
        </div>
      )}
    </div>
  );
}

export default function WaiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white"></div>}>
      <WaiterLayoutContent>{children}</WaiterLayoutContent>
    </Suspense>
  );
}