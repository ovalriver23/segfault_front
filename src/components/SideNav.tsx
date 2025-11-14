'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/lib/context/AuthContext';

// Navigation icons imports
const imgHome = "/images/admin/home-navbar.svg";
const imgTable = "/images/admin/tables-navbar.svg";
const imgMenu = "/images/admin/menu-navbar.svg";
const imgStats = "/images/admin/stats-navbar.svg";
const imgStaff = "/images/admin/staff-navbar.svg";
const imgSettings = "/images/admin/options-navbar.svg";
const imgAvatar = "/images/admin/avatar-navbar.png";

// Component props interface
interface SideNavProps {
  activeTab?: string;    // Currently active navigation tab
  isOpen?: boolean;      // Controls sidebar visibility on mobile
  onClose?: () => void;  // Callback to close sidebar on mobile
  onToggle?: () => void; // Callback to toggle sidebar on mobile
}

/**
 * SideNav Component
 * 
 * Responsive sidebar navigation for the dashboard.
 * - Desktop: Always visible on the left side
 * - Mobile: Slides in from left when opened, with overlay backdrop and full text labels
 */
export default function SideNav({ activeTab = 'general', isOpen = false, onClose, onToggle }: SideNavProps) {
  // Track active navigation item
  const [active, setActive] = useState(activeTab);
  const router = useRouter();
   const { user, loading, error, logout } = useAuth();

  // Navigation menu items configuration
  const navItems = [
    { id: 'general', label: 'Genel', icon: imgHome, href: '/dashboard' },
    { id: 'tables', label: 'Masalar', icon: imgTable, href: '/dashboard/tables' },
    { id: 'menu', label: 'Menü', icon: imgMenu, href: '/dashboard/menu' },
    { id: 'stats', label: 'İstatistik', icon: imgStats, href: '/dashboard/stats' },
    { id: 'staff', label: 'Personel', icon: imgStaff, href: '/dashboard/staff' },
    { id: 'settings', label: 'Ayarlar', icon: imgSettings, href: '/dashboard/settings' },
  ];

  // Handle navigation item click
  const handleLinkClick = (itemId: string) => {
    setActive(itemId);
    if (onClose) onClose(); // Close mobile sidebar after navigation
  };

  // Handle user logout
  const handleLogOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        logout();
        // Redirect to login page after successful logout
        router.push('/');
      } else {
        const data = await response.json();
        console.error('Logout failed:', data.error || data.message);
        // Still redirect to login page even if backend logout fails
        router.push('/log-in');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Redirect to login page even if there's an error
      router.push('/log-in');
    }
  };

  return (
    <>
      {/* Mobile overlay - darkens background when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Main sidebar container */}
      <div
        className={`
          fixed md:relative h-full bg-white flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-72 md:w-64
          border-r border-gray-200
        `}
        data-name="SideNav"
      >
        {/* Close button - only visible on mobile */}
        <div className="flex justify-between items-center pl-6 pr-4 pt-4 pb-2 md:hidden">
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Brand section - EasyOrder logo */}
        <div className="flex flex-row items-center justify-start px-7 pt-2 md:pt-4 pb-3">
          <Link
            href="/dashboard"
            className="text-2xl md:text-3xl font-black text-black hover:text-gray-800 transition-colors"
            style={{ fontFamily: 'Pontano Sans, sans-serif' }}
            onClick={() => handleLinkClick('general')}
          >
            {/* Always show full EasyOrder text */}
            EasyOrder
          </Link>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 px-4 py-2 pt-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <Link
                replace={true}
                key={item.id}
                href={item.href}
                onClick={() => handleLinkClick(item.id)}
                className={`
                  flex items-center justify-start gap-4 h-14 md:h-12 px-4 mb-3 md:mb-2 rounded-xl
                  transition-all duration-200
                  group
                  ${isActive
                    ? 'bg-orange-50 text-orange-600'  // Active state: orange background & text
                    : 'text-gray-600 hover:bg-orange-50'  // Inactive state: gray with orange hover
                  }
                `}
              >
                {/* Navigation icon */}
                <div className="w-6 h-6 md:w-5 md:h-5 flex items-center justify-center shrink-0">
                  <img
                    src={item.icon}
                    alt={item.label}
                    className={`w-full h-full object-contain transition-all
                      ${isActive
                        ? 'brightness-0 saturate-100 invert-45 sepia-100 hue-rotate-350 '  // Orange filter for active icon
                        : 'opacity-60 group-hover:opacity-80'  // Gray filter for inactive icons
                      }
                    `}
                  />
                </div>

                {/* Navigation label - now always visible on both mobile and desktop */}
                <span
                  className={`
                    text-base font-medium
                    ${isActive ? 'text-orange-600 font-semibold' : 'text-gray-600'}
                  `}
                  style={{ fontFamily: 'Pontano Sans, sans-serif' }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

{/*
        <div className="dropdown dropdown-top">
          <div tabIndex={0} role="button" className="btn m-1">Click ⬆️</div>
          <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
            <li><a>Item 1</a></li>
            <li><a>Item 2</a></li>
          </ul>
        </div>
        */}

        {/* User avatar at bottom of sidebar */}
        <div className="dropdown dropdown-top dropdown-center px-4 md:px-6 pb-6">
          <div tabIndex={0} role="button" className="flex justify-start items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
              <div className="text-lg font-bold text-gray-700">
                {loading ? '...' : user?.username?.charAt(0).toUpperCase() || 'N'}
              </div>
            </div>
            {/* User info - only visible when sidebar is open (mobile) or on desktop */}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">
                {loading ? 'Loading...' : user?.username || 'User Name'}
              </span>
              <span className="text-xs text-gray-500">
                {loading ? '...' : user?.role || 'Admin'}
              </span>
            </div>
          </div>
          <ul tabIndex={0} className="dropdown-content menu bg-white text-gray-700 rounded-box z-1 w-52 p-2 mb-2 shadow-lg border border-gray-200">
            <li><button onClick={handleLogOut} className="w-full text-left">Çıkış Yap</button></li>
          </ul>
        </div>
      </div>
    </>
  );
}