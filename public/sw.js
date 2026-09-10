self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  let data = {
    title: 'EasyOrder Bildirim',
    body: 'Yeni bir bildirim var!',
    icon: '/images/landing/logo.png',
    badge: '/images/landing/logo.png',
    tag: 'easyorder-notification',
    requireInteraction: true,
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: data.badge,
        tag: payload.tag || data.tag,
        requireInteraction: true,
        data: payload.data || {}
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  event.waitUntil((async function() {
    try {
      // Eski/stale bir push endpoint'i backend'de kalmış olsa bile, aktif
      // bir garson oturumu yokken bildirimi kullanıcıya gösterme.
      const authResponse = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!authResponse.ok) return;

      const user = await authResponse.json();
      if (user.role !== 'STAFF') return;

      await self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        requireInteraction: data.requireInteraction,
        vibrate: [200, 100, 200],
        data: data.data
      });
    } catch (error) {
      console.error('Push session check failed:', error);
    }
  })());
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  event.notification.close();

  // Bildirime tıklandığında bildirimleri sayfasına git
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Açık bir pencere varsa odaklan
      for (let client of clientList) {
        if (client.url.includes('/waiter/notifications') && 'focus' in client) {
          return client.focus();
        }
      }
      // Yoksa yeni pencere aç
      if (clients.openWindow) {
        return clients.openWindow('/waiter/notifications');
      }
    })
  );
});

self.addEventListener('install', function(event) {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});
