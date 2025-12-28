'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../app/lib/context/AuthContext';

// Navigation icons imports - we'll use similar icons from admin folder


// Navigation menu items configuration for Superadmin
const navItems = [
    {
        id: 'dashboard', label: 'Dashboard', href: '/Superadmin', icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        id: 'restaurants', label: 'Restoranlar', href: '/Superadmin/restaurants', icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        )
    },
    {
        id: 'map', label: 'Harita', href: '/Superadmin/map', icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        )
    },
    {
        id: 'pending', label: 'Onay Bekleyenler', href: '/Superadmin/pending', icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        id: 'statistics', label: 'İstatistikler', href: '/Superadmin/statistics', icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    },
];

// Component props interface
interface SuperadminNavProps {
    activeTab?: string;    // Currently active navigation tab
    isOpen?: boolean;      // Controls sidebar visibility on mobile
    onClose?: () => void;  // Callback to close sidebar on mobile
    onToggle?: () => void; // Callback to toggle sidebar on mobile
}

/**
 * SuperadminNav Component
 * 
 * Responsive sidebar navigation for the superadmin panel.
 * - Desktop: Always visible on the left side
 * - Mobile: Slides in from left when opened, with overlay backdrop and full text labels
 * - Automatically detects and maintains active tab from URL
 */
export default function SuperadminNav({ activeTab = 'dashboard', isOpen = false, onClose, onToggle }: SuperadminNavProps) {
    const router = useRouter();
    const pathname = usePathname(); // Get current URL path
    const { user, loading, error, logout } = useAuth();

    /**
     * Determine active tab from current pathname
     * This ensures the correct tab is highlighted even after page refresh
     */
    const getActiveTabFromPath = useCallback((path: string) => {
        // Exact match for superadmin home
        if (path === '/Superadmin') return 'dashboard';

        // Match against nav items - check if path starts with the item's href
        const activeItem = navItems.find(item =>
            item.href !== '/Superadmin' && path.startsWith(item.href)
        );

        return activeItem ? activeItem.id : 'dashboard';
    }, []);

    // Track active navigation item - initialize from URL
    const [active, setActive] = useState(() => getActiveTabFromPath(pathname));

    // Update active tab whenever the pathname changes (navigation or refresh)
    useEffect(() => {
        const newActive = getActiveTabFromPath(pathname);
        setActive(newActive);
    }, [pathname, getActiveTabFromPath]);

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
            logout();
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
                data-name="SuperadminNav"
            >
                {/* Close button - only visible on mobile */}
                <div className="flex justify-between items-center pl-6 pr-4 pt-4 pb-2 md:hidden">
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-ghost btn-circle text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Brand section - EasyOrder Superadmin logo */}
                <div className="flex flex-col items-start justify-start px-7 pt-2 md:pt-4 pb-3">
                    <Link
                        href="/Superadmin"
                        className="text-3xl md:text-3xl font-medium text-black hover:text-gray-800 transition-colors tracking-tight"
                        style={{ fontFamily: 'Pontano Sans, sans-serif' }}
                        onClick={() => handleLinkClick('dashboard')}
                    >
                        EasyOrder
                    </Link>
                    <span className="text-sm font-semibold mt-1" style={{ fontFamily: 'Pontano Sans, sans-serif', color: '#ee46a2' }}>
                        Superadmin Panel
                    </span>
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
                                    <div className={`w-full h-full transition-all flex items-center justify-center
                      ${isActive
                                            ? 'text-orange-600' // Orange icon for active
                                            : 'opacity-60 group-hover:opacity-80'  // Gray icon for inactive
                                        }
                    `}>
                                        {item.icon}
                                    </div>
                                </div>

                                {/* Navigation label - now always visible on both mobile and desktop */}
                                <span
                                    className={`
                    text-base font-medium
                    ${isActive ? 'text-orange-600 font-bold' : 'text-gray-600'}
                  `}
                                    style={{ fontFamily: 'Pontano Sans, sans-serif' }}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Scrolling Welcome Banner */}
                <div className="mx-4 mb-3 rounded-lg bg-orange-200 overflow-hidden whitespace-nowrap">
                    <div style={{ animation: 'marquee 8s linear infinite' }} className="inline-block py-1">
                        <span className="text-pink-700 font-bold text-xs mx-4">
                            Welcome sadmin ! We were waiting you !
                        </span>
                        <span className="text-pink-700 font-bold text-xs mx-4">
                            Welcome sadmin ! We were waiting you !
                        </span>
                    </div>
                </div>
                <style jsx>{`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                `}</style>

                {/* User avatar at bottom of sidebar */}
                <div className="dropdown dropdown-top dropdown-center px-4 md:px-6 pb-6">
                    <div tabIndex={0} role="button" className="flex justify-start items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden border-2 border-pink-300">
                            {loading ? (
                                <div className="text-lg font-bold text-pink-700">...</div>
                            ) : user?.profilePhotoUrl ? (
                                <Image
                                    src={user.profilePhotoUrl}
                                    alt={user.username || 'User avatar'}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-lg font-bold text-pink-700">
                                    {user?.username?.charAt(0).toUpperCase() || 'S'}
                                </div>
                            )}
                        </div>
                        {/* User info - only visible when sidebar is open (mobile) or on desktop */}
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">
                                {loading ? 'Loading...' : user?.username || 'Superadmin'}
                            </span>
                            <span className="text-xs text-[#ee46a2]">
                                {loading ? '...' : 'SUPER_ADMIN'}
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
