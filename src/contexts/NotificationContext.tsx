'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as api from '@/lib/api';

export interface Notification {
  id: string;
  type: 'board_invitation' | 'new_memory' | 'user_joined' | 'comment' | 'mention';
  is_read: boolean;
  created_at: string;
  data: {
    board_id?: string;
    board_name?: string;
    invited_by_id?: string;
    invited_by_email?: string;
    entry_id?: string;
    created_by_id?: string;
    created_by_email?: string;
    user_id?: string;
    user_email?: string;
    [key: string]: any;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  acceptBoardInvitation: (notificationId: string, boardId: string) => Promise<{ success: boolean; error?: string }>;
  declineBoardInvitation: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await api.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const acceptBoardInvitation = async (notificationId: string, boardId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      await api.acceptInvite(notificationId, boardId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      return { success: true };
    } catch (err: any) {
      console.error('Error accepting board invitation:', err);
      return { success: false, error: err.message || 'Failed to accept invitation' };
    }
  };

  const declineBoardInvitation = async (notificationId: string) => {
    try {
      await api.declineInvite(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Error declining invitation:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead: handleMarkAsRead,
      markAllAsRead: handleMarkAllAsRead,
      acceptBoardInvitation,
      declineBoardInvitation,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
