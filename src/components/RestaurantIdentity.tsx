'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../app/lib/context/AuthContext';

type RestaurantIdentityVariant = 'sidebar' | 'mobile' | 'dashboard';

interface RestaurantIdentityProps {
  variant: RestaurantIdentityVariant;
  className?: string;
}

const FALLBACK_RESTAURANT_NAME = 'İşletme Paneli';

export default function RestaurantIdentity({
  variant,
  className = '',
}: RestaurantIdentityProps) {
  const { user } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);

  const restaurantName = user?.restaurantName?.trim() || FALLBACK_RESTAURANT_NAME;
  const logoUrl = user?.restaurantLogoUrl?.trim() || null;
  const initial = Array.from(restaurantName)[0]?.toLocaleUpperCase('tr-TR') || 'İ';

  useEffect(() => {
    setImageFailed(false);
  }, [logoUrl]);

  const avatarSize = variant === 'dashboard'
    ? 'h-12 w-12 sm:h-14 sm:w-14'
    : variant === 'sidebar'
      ? 'h-10 w-10'
      : 'h-9 w-9';

  const avatar = logoUrl && !imageFailed ? (
    <div className="avatar shrink-0">
      <div className={`relative overflow-hidden rounded-xl bg-white ring-1 ring-primary-200 ${avatarSize}`}>
        <Image
          src={logoUrl}
          alt={`${restaurantName} logosu`}
          fill
          sizes={variant === 'dashboard' ? '(max-width: 640px) 56px, 64px' : variant === 'sidebar' ? '48px' : '36px'}
          className="object-contain p-1"
          onError={() => setImageFailed(true)}
        />
      </div>
    </div>
  ) : (
    <div className="avatar placeholder shrink-0">
      <div className={`rounded-xl bg-primary-100 text-text-500 ring-1 ring-primary-200 ${avatarSize}`}>
        <span className={variant === 'dashboard' ? 'text-xl font-bold sm:text-2xl' : 'text-lg font-bold'}>
          {initial}
        </span>
      </div>
    </div>
  );

  if (variant === 'dashboard') {
    return (
      <section
        className={`flex items-center gap-4 ${className}`}
        aria-label={`${restaurantName} işletme özeti`}
      >
        {avatar}
        <div className="min-w-0">
          <p className="mb-0.5 text-sm font-medium text-gray-400">Hoş geldiniz</p>
          <h1 className="break-words text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            {restaurantName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            İşletmenizin bugünkü operasyonlarını takip edin.
          </p>
        </div>
      </section>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`flex min-w-0 items-center justify-center gap-2.5 ${className}`}>
        {avatar}
        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-semibold leading-tight text-gray-900">
            {restaurantName}
          </p>
          <p className="mt-0.5 text-xs leading-tight text-gray-500">Powered by EasyOrder</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      {avatar}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-base font-semibold leading-tight text-gray-900">
          {restaurantName}
        </p>
        <p className="mt-1 text-xs leading-tight text-gray-400">Powered by EasyOrder</p>
      </div>
    </div>
  );
}
