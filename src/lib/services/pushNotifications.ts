import { getMessaging, getToken } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-hot-toast';

const PUBLIC_VAPID_KEY = 'YOUR_PUBLIC_VAPID_KEY'; // Replace with your VAPID key

export async function initializePushNotifications() {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    const messaging = getMessaging();

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    const token = await getToken(messaging, {
      vapidKey: PUBLIC_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (auth.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        pushToken: token,
        notifications_enabled: true
      });
    }

    return token;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    toast.error('Failed to enable push notifications');
    return null;
  }
}

export async function unsubscribeFromPushNotifications() {
  try {
    if (!auth.currentUser) return;

    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
    }

    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      pushToken: null,
      notifications_enabled: false
    });

    toast.success('Push notifications disabled');
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    toast.error('Failed to disable push notifications');
  }
}