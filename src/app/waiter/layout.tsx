'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function WaiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if current page is login page
  const isLoginPage = pathname === '/waiter/login';

  // Aktif ikon rengini belirlemek için yardımcı fonksiyon
  // Eğer path tam eşleşiyorsa koyu renk (#683817), değilse soluk renk (#b09886)
  const isActive = (path: string) => pathname === path ? "text-[#683817]" : "text-[#b09886]";

  return (
    <div className={`min-h-screen bg-white font-sans ${!isLoginPage ? 'pb-20' : ''}`}>
      {/* Ana İçerik */}
      <main className="max-w-md mx-auto min-h-screen bg-white">
        {children}
      </main>

      {/* Bottom Navigation Bar - Hidden on login page */}
      {!isLoginPage && (
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