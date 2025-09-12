// Import and configure the Firebase SDK
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// Get the query parameters from the service worker's URL
const urlParams = new URLSearchParams(location.search);

// Create the config object by extracting the parameters
const firebaseConfig = {
  apiKey: urlParams.get('apiKey'),
  authDomain: urlParams.get('authDomain'),
  projectId: urlParams.get('projectId'),
  storageBucket: urlParams.get('storageBucket'),
  messagingSenderId: urlParams.get('messagingSenderId'),
  appId: urlParams.get('appId'),
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