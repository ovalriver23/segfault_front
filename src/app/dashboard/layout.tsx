'use client';

import { useState, createContext, useContext } from 'react';
import SideNav from '../../components/SideNav';
import { AuthProvider } from '../lib/context/AuthContext';

interface PageContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

const PageContext = createContext<PageContextType>({
  pageTitle: '',
  setPageTitle: () => { },
});

export const usePageTitle = () => useContext(PageContext);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <PageContext.Provider value={{ pageTitle, setPageTitle }}>
      <AuthProvider>
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          {/* Sidebar */}
          <SideNav
            activeTab='general'
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            onToggle={toggleSidebar}
          />

          {/* Main content - Full width with gray background */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {/* Page content with padding inside */}
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </AuthProvider>
    </PageContext.Provider>
  );
}