'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

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
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
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

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

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
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('board_members')
        .select('id')
        .eq('board_id', boardId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        await markAsRead(notificationId);
        return { success: false, error: 'Already a member of this board' };
      }

      // Insert into board_members
      const { error: insertError } = await supabase
        .from('board_members')
        .insert([{
          board_id: boardId,
          user_id: user.id,
          role: 'member'
        }]);

      if (insertError) throw insertError;

      // Mark notification as read
      await markAsRead(notificationId);

      return { success: true };
    } catch (err) {
      console.error('Error accepting board invitation:', err);
      return { success: false, error: 'Failed to accept invitation' };
    }
  };

  const declineBoardInvitation = async (notificationId: string) => {
    // Just mark as read, keep in history
    await markAsRead(notificationId);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
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
