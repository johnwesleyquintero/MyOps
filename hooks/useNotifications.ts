
import { useState, useCallback } from 'react';
import { Notification, NotificationAction } from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'info' = 'info',
    action?: NotificationAction
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type, action }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    showToast,
    removeNotification
  };
};
