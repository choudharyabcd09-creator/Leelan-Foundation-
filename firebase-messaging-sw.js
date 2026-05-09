// firebase-messaging-sw.js — must be served from site root (same origin as index.html)
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA7uGw-9tXbmy5ii9M-8f-vYE2uxA4HBKA",
  authDomain: "springminds-e6fad.firebaseapp.com",
  projectId: "springminds-e6fad",
  storageBucket: "springminds-e6fad.firebasestorage.app",
  messagingSenderId: "699089640854",
  appId: "1:699089640854:web:3da1b79ea8078e97d111b7"
});

const messaging = firebase.messaging();

// Background push handler — show WhatsApp-style notification
messaging.onBackgroundMessage(payload => {
  try {
    const d = payload.data || {};
    const senderName = d.senderName || (payload.notification && payload.notification.title) || 'Student';
    const body       = d.body       || (payload.notification && payload.notification.body)  || '';
    const uid        = d.senderUid  || '';

    self.registration.showNotification('SpringMinds', {
      body: senderName + ': ' + body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'pc-' + uid,
      renotify: true,
      data: { uid: uid, name: senderName, click_action: '/?openChat=' + encodeURIComponent(uid) }
    });
  } catch (e) {}
});

// Click → focus existing tab and open that exact personal chat
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = (data.click_action) || '/';
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if ('focus' in client) {
        client.postMessage({ type: 'OPEN_PC_CHAT', uid: data.uid, name: data.name });
        return client.focus();
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
  })());
});
