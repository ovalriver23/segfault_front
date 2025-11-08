'use client';

import { useState } from 'react';
import SideNav from '../../components/SideNav';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Hamburger menu button for mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-30 md:hidden btn btn-circle btn-ghost hover:border-secondary-500 text-secondary-500 hover:bg-secondary-500 hover:text-background-500"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className="w-20 md:w-64 flex-none">
        <SideNav 
          activeTab='general' 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="grow overflow-y-auto p-6 md:p-12 pt-16 md:pt-6">
        {children}
      </div>
    </div>
  );
}