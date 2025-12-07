'use client';

import { useState, createContext, useContext } from 'react';
import SideNav from '../../components/SideNav';
import { AuthProvider } from '../lib/context/AuthContext';

const PageTitleContext = createContext<{
  pageTitle: string;
  setPageTitle: (title: string) => void;
}>({
  pageTitle: '',
  setPageTitle: () => {},
});

export const usePageTitle = () => useContext(PageTitleContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      <AuthProvider>
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
          <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="btn btn-ghost btn-square text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Pontano Sans, sans-serif' }}>
              EasyOrder
            </span>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          {/* Page content with padding */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      </AuthProvider>
    </PageTitleContext.Provider>
  );
}