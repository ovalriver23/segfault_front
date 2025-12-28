'use client';

import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  isLoading: boolean;
  error: string | null;
  notSupportedReason: string | null;
}

export function usePushNotification() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    isLoading: true,
    error: null,
    notSupportedReason: null
  });

  // Service Worker ve Push API desteğini kontrol et
  useEffect(() => {
    const checkSupport = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
          setState(prev => ({
            ...prev,
            isSupported: false,
            isLoading: false,
            notSupportedReason: 'Tarayıcı ortamı bulunamadı'
          }));
          return;
        }

        const hasServiceWorker = 'serviceWorker' in navigator;
        const hasPushManager = 'PushManager' in window;
        const hasNotification = 'Notification' in window;

        if (!hasServiceWorker || !hasPushManager || !hasNotification) {
          // Detect iOS Safari without PWA
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isStandalone = (window.navigator as any).standalone === true;

          let reason = 'Push bildirimleri bu cihazda desteklenmiyor';
          if (isIOS && !isStandalone) {
            reason = 'iOS cihazlarda bildirim almak için uygulamayı Ana Ekrana ekleyin (Paylaş > Ana Ekrana Ekle)';
          } else if (!hasServiceWorker) {
            reason = 'Service Worker desteklenmiyor';
          } else if (!hasPushManager) {
            reason = 'Push API desteklenmiyor';
          }

          setState(prev => ({
            ...prev,
            isSupported: false,
            isLoading: false,
            notSupportedReason: reason
          }));
          return;
        }

        const permission = Notification.permission;

        // Service Worker'ı kaydet
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);

          // Mevcut subscription'ı kontrol et
          const subscription = await registration.pushManager.getSubscription();

          setState({
            isSupported: true,
            isSubscribed: !!subscription,
            permission,
            isLoading: false,
            error: null,
            notSupportedReason: null
          });
        } catch (err) {
          console.error('Service Worker registration failed:', err);
          setState(prev => ({
            ...prev,
            isSupported: false,
            isLoading: false,
            error: 'Service Worker kaydedilemedi',
            notSupportedReason: 'Service Worker kaydedilemedi'
          }));
        }
      } catch (err) {
        console.error('Push notification check failed:', err);
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          error: 'Bildirim desteği kontrol edilemedi',
          notSupportedReason: 'Bildirim desteği kontrol edilemedi'
        }));
      }
    };

    checkSupport();
  }, []);

  // VAPID Public Key al
  const getVapidPublicKey = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/waiter/notifications/vapid-key', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('VAPID key alınamadı');
      }

      const data = await response.json();
      return data.publicKey;
    } catch (err) {
      console.error('Error getting VAPID key:', err);
      return null;
    }
  };

  // URL-safe base64'ü Uint8Array'e çevir
  const urlBase64ToUint8Array = (base64String: string): Uint8Array<ArrayBuffer> => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Bildirim izni iste ve abone ol
  const subscribe = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Push bildirimleri desteklenmiyor' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Bildirim izni iste
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        setState(prev => ({
          ...prev,
          permission,
          isLoading: false,
          error: 'Bildirim izni verilmedi'
        }));
        return false;
      }

      // VAPID key al
      const vapidPublicKey = await getVapidPublicKey();
      if (!vapidPublicKey) {
        throw new Error('VAPID key alınamadı');
      }

      // Service Worker registration al
      const registration = await navigator.serviceWorker.ready;

      // Push subscription oluştur
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('Push subscription:', subscription);

      // Backend'e gönder
      const response = await fetch('/api/waiter/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
          }
        })
      });

      if (!response.ok) {
        throw new Error('Abonelik kaydedilemedi');
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        permission: 'granted',
        isLoading: false
      }));

      return true;
    } catch (err: any) {
      console.error('Subscribe error:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Abonelik oluşturulamadı'
      }));
      return false;
    }
  }, [state.isSupported]);

  // Abonelikten çık
  const unsubscribe = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Backend'den sil
        await fetch('/api/waiter/notifications/unsubscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });

        // Tarayıcıdan sil
        await subscription.unsubscribe();
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false
      }));

      return true;
    } catch (err: any) {
      console.error('Unsubscribe error:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Abonelik iptal edilemedi'
      }));
      return false;
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe
  };
}