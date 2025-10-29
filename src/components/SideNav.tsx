'use client';

import { useState } from 'react';
import Link from 'next/link';

const imgHome = "http://localhost:3845/assets/1861b8292a983bcc25c71541a406d52777e85501.svg";
const imgTable = "http://localhost:3845/assets/4d86b09cdf4f431820fb07505881bb14697e4452.svg";
const imgMenu = "http://localhost:3845/assets/2a80877f85bcf126bf05694f61b129190ae7b53e.svg";
const imgStats = "http://localhost:3845/assets/de4b84e9ee1d4bd9d44a9ec85e5a4771ca41fae2.svg";
const imgSettings = "http://localhost:3845/assets/1741b25ed6c01aa9eec196a71b53f4efbb787388.svg";
const imgAvatar = "http://localhost:3845/assets/700a5e209a2ff8d2772381b94a03f945b1216285.png";

interface SideNavProps {
  activeTab?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SideNav({ activeTab = 'menu', isOpen = false, onClose }: SideNavProps) {
  const [active, setActive] = useState(activeTab);

  const navItems = [
    { id: 'general', label: 'GENEL', icon: imgHome, href: '/dashboard' },
    { id: 'tables', label: 'MASALAR', icon: imgTable, href: '/dashboard/tables' },
    { id: 'menu', label: 'MENÜ', icon: imgMenu, href: '/dashboard/menu' },
    { id: 'stats', label: 'VERİ', icon: imgStats, href: '/dashboard/stats' },
    { id: 'settings', label: 'AYARLAR', icon: imgSettings, href: '/dashboard/settings' },
  ];

  const handleLinkClick = (itemId: string) => {
    setActive(itemId);
    if (onClose) onClose(); // Close drawer on mobile after clicking
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-accent-200 opacity-70 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          fixed md:relative h-full bg-background-500 flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-20 md:w-64
        `}
        data-name="SideNav"
      >
        {/* Vertical Divider */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300" />
        
        {/* Close button for mobile */}
        <div className="flex justify-between items-center pl-6 pr-4 pt-4 pb-2 md:hidden">
          <button 
            onClick={onClose}
            className=" btn btn-sm btn-ghost btn-circle hover:border-secondary-500 text-secondary-500 hover:bg-secondary-500 hover:text-background-500"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Brand Section */}
        <div className="md:flex md:flex-row md:items-center md:justify-center px-4 pt-2 md:pt-4 pb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-accent-500 text-center md:text-left">
            <span className="md:hidden">QR</span>
            <span className="hidden md:inline">Qrinyo</span>
          </h1>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-2 md:px-4 py-2">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => handleLinkClick(item.id)}
              className={`
                flex items-center justify-center md:justify-start gap-3 h-16 px-3 md:px-6 mb-2 rounded-[32px]
                transition-all duration-200
                ${isActive 
                  ? 'border-2 border-primary-500' 
                  : 'hover:bg-background-600'
                }
              `}
            >
              <div className="w-[42px] h-[42px] flex items-center justify-center flex-shrink-0">
                <img src={item.icon} alt={item.label} className="w-full h-full object-contain" />
              </div>
              <span 
                className={`
                  hidden md:block text-2xl font-semibold
                  ${isActive ? 'text-primary-500' : 'text-primary-400'}
                `}
                style={{ fontFamily: 'Pontano Sans, sans-serif' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Avatar Section */}
      <div className="px-4 md:px-8 pb-6 flex justify-center md:justify-start">
        <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl overflow-hidden">
          <img src={imgAvatar} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
      </div>
    </>
  );
}
