'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function WaiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/waiter/login';

  // Aktif ikon rengini belirlemek için yardımcı fonksiyon
  const isActive = (path: string) => pathname === path ? "text-[#683817]" : "text-[#b09886]";

  return (
    // Login sayfasındaysak padding verme, diğer sayfalarda alt bar için pb-20 ver
    <div className={`min-h-screen bg-white font-sans ${isLoginPage ? '' : 'pb-20'}`}>
      
      {/* Ana İçerik */}
      <main className="max-w-md mx-auto min-h-screen bg-white relative">
        {children}
      </main>

      {/* Bottom Navigation Bar - Login sayfasında GİZLE */}
      {!isLoginPage && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-6 pt-3 px-6 z-50">
          <div className="max-w-md mx-auto flex justify-between items-center px-4">
            
            {/* Masalar Butonu */}
            <Link href="/waiter/tables" className="flex flex-col items-center gap-1 w-12">
              <svg 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={`transition-colors duration-200 ${isActive('/waiter/tables')}`}
              >
                <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                {pathname === '/waiter/tables' && <path d="M5 22h14" stroke="#683817" strokeWidth="2" strokeLinecap="round" className="mt-1" />} 
              </svg>
            </Link>

            {/* Bildirimler Butonu */}
            <Link href="/waiter/notifications" className="flex flex-col items-center gap-1 w-12">
              <div className="relative">
                <svg 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`transition-colors duration-200 ${isActive('/waiter/notifications')}`}
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {pathname === '/waiter/notifications' && (
                   <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-[#683817] rounded-full"></div>
                )}
              </div>
            </Link>

            {/* Profil Butonu */}
            <Link href="/waiter/profile" className="flex flex-col items-center gap-1 w-12">
              <div className="relative">
                <svg 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`transition-colors duration-200 ${isActive('/waiter/profile')}`}
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {pathname === '/waiter/profile' && (
                   <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-[#683817] rounded-full"></div>
                )}
              </div>
            </Link>

          </div>
        </div>
      )}
    </div>
  );
}