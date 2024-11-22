import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import type { Notification } from '../types';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    let unsubscribe: (() => void) | null = null;
    let mounted = true;

    const setupNotifications = async () => {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('user_id', '==', auth.currentUser!.uid),
          orderBy('created_at', 'desc'),
          limit(50)
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!mounted) return;

            const notifs = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Notification[];

            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.read).length);
            setLoading(false);
          },
          (error) => {
            console.error('Notifications subscription error:', error);
            if (mounted) {
              toast.error('Failed to load notifications');
              setNotifications([]);
              setUnreadCount(0);
              setLoading(false);
            }
          }
        );
      } catch (error) {
        console.error('Error setting up notifications:', error);
        if (mounted) {
          toast.error('Failed to connect to notifications');
          setNotifications([]);
          setUnreadCount(0);
          setLoading(false);
        }
      }
    };

    setupNotifications();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="relative p-2">
        <Bell className="h-6 w-6 text-gray-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-400 hover:text-white"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-surface-light rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-surface-light">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => {
                const createdAt = notification.created_at?.toDate?.() || new Date();
                
                return (
                  <Link
                    key={notification.id}
                    to={notification.link}
                    className={`block p-4 hover:bg-surface-light border-b border-surface-light ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => setShowDropdown(false)}
                  >
                    <p className="text-white">{notification.content}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {format(createdAt, 'PP')}
                    </p>
                  </Link>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-400">
                No notifications yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}