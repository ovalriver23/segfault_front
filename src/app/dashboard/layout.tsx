'use client';

import { useState, createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../components/SideNav';
import RestaurantIdentity from '../../components/RestaurantIdentity';
import { AuthProvider, useAuth } from '../lib/context/AuthContext';

const PageTitleContext = createContext<{
  pageTitle: string;
  setPageTitle: (title: string) => void;
}>({
  pageTitle: '',
  setPageTitle: () => {},
});

export const usePageTitle = () => useContext(PageTitleContext);

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/log-in');
      } else if (user.role !== 'MANAGER') {
        // Staff trying to access dashboard -> show error
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthorized && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600 mb-6">Bu sayfaya erişim yetkiniz bulunmamaktadır. Yönetici paneline sadece <span className="font-semibold">Manager</span> rolündeki kullanıcılar erişebilir.</p>
          <button
            onClick={() => router.push('/waiter/tables')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Garson Paneline Git
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SideNav 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Mobile hamburger menu button - only visible on mobile */}
        <div className="navbar sticky top-0 z-30 min-h-16 border-b border-gray-200 bg-white px-3 md:hidden">
          <div className="navbar-start w-12 shrink-0">
            <button
              onClick={toggleSidebar}
              className="btn btn-ghost btn-square text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              aria-label="Menüyü aç"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="navbar-center min-w-0 flex-1 justify-center px-2">
            <RestaurantIdentity
              variant="mobile"
              className="max-w-[calc(100vw-7rem)]"
            />
          </div>
          <div className="navbar-end w-12 shrink-0" aria-hidden="true" />
        </div>

        {/* Page content with padding */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pageTitle, setPageTitle] = useState('');

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      <AuthProvider>
        <DashboardContent>{children}</DashboardContent>
      </AuthProvider>
    </PageTitleContext.Provider>
  );
}
