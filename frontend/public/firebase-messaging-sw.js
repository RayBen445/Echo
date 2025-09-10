// Import and configure the Firebase SDK
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// Initialize Firebase app in service worker
const firebaseConfig = {
  // These will be replaced with actual values from environment variables
  // during the build process or at runtime
  apiKey: self.FIREBASE_CONFIG?.apiKey || 'demo-key',
  authDomain: self.FIREBASE_CONFIG?.authDomain || 'demo-project.firebaseapp.com',
  projectId: self.FIREBASE_CONFIG?.projectId || 'demo-project',
  storageBucket: self.FIREBASE_CONFIG?.storageBucket || 'demo-project.appspot.com',
  messagingSenderId: self.FIREBASE_CONFIG?.messagingSenderId || '123456789',
  appId: self.FIREBASE_CONFIG?.appId || '1:123456789:web:demo'
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle background messages
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Echo Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/echo-icon.svg',
    badge: '/echo-icon.svg',
    tag: 'echo-notification',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();
  
  // Open the app when notification is clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});