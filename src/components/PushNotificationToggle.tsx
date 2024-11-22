import React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { toast } from 'react-hot-toast';

export default function PushNotificationToggle() {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success('Push notifications disabled');
      } else {
        await subscribe();
        toast.success('Push notifications enabled');
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      toast.error('Failed to update push notification settings');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-surface-light hover:border-primary/50 transition-colors"
    >
      {isSubscribed ? (
        <>
          <Bell className="h-5 w-5 text-primary" />
          <span className="text-white">Notifications Enabled</span>
        </>
      ) : (
        <>
          <BellOff className="h-5 w-5 text-gray-400" />
          <span className="text-gray-400">Enable Notifications</span>
        </>
      )}
    </button>
  );
}