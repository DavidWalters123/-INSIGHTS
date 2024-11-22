import { useState, useEffect } from 'react';
import { initializePushNotifications, unsubscribeFromPushNotifications } from '../services/pushNotifications';
import { usePreferencesStore } from '../stores/userPreferences';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { preferences, updatePreferences } = usePreferencesStore();

  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      setIsSupported(supported);

      if (supported) {
        const permission = await Notification.permission;
        setIsSubscribed(permission === 'granted' && preferences.pushNotifications);
      }
    };

    checkSupport();
  }, [preferences.pushNotifications]);

  const subscribe = async () => {
    try {
      const token = await initializePushNotifications();
      if (token) {
        setIsSubscribed(true);
        updatePreferences({ pushNotifications: true });
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setIsSubscribed(false);
      updatePreferences({ pushNotifications: false });
    }
  };

  const unsubscribe = async () => {
    try {
      await unsubscribeFromPushNotifications();
      setIsSubscribed(false);
      updatePreferences({ pushNotifications: false });
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe
  };
}