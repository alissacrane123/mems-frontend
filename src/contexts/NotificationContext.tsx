'use client';

import { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export interface Notification {
  id: string;
  type: 'board_invitation' | 'new_memory' | 'user_joined' | 'comment' | 'mention';
  isRead: boolean;
  createdAt: string;
  data: {
    boardId?: string;
    boardName?: string;
    invitedById?: string;
    invitedByEmail?: string;
    entryId?: string;
    createdById?: string;
    createdByEmail?: string;
    userId?: string;
    userEmail?: string;
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
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isPending: loading,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: queryKeys.notifications,
    queryFn: api.getNotifications,
    enabled: !!user,
  });

  const setReadOptimistic = (id?: string) => {
    queryClient.setQueryData<Notification[]>(queryKeys.notifications, (old) =>
      (old ?? []).map((n) =>
        id ? (n.id === id ? { ...n, isRead: true } : n) : { ...n, isRead: true }
      )
    );
  };

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => api.markAsRead(notificationId),
    onMutate: (notificationId) => setReadOptimistic(notificationId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.markAllAsRead(),
    onMutate: () => setReadOptimistic(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });

  const acceptMutation = useMutation({
    mutationFn: ({ notificationId, boardId }: { notificationId: string; boardId: string }) =>
      api.acceptInvite(notificationId, boardId),
    onSuccess: (_, { notificationId }) => {
      setReadOptimistic(notificationId);
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });

  const declineMutation = useMutation({
    mutationFn: (notificationId: string) => api.declineInvite(notificationId),
    onMutate: (notificationId) => setReadOptimistic(notificationId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleAccept = async (notificationId: string, boardId: string) => {
    try {
      await acceptMutation.mutateAsync({ notificationId, boardId });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to accept invitation' };
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications: async () => { await refetch(); },
        markAsRead: markAsReadMutation.mutateAsync,
        markAllAsRead: markAllAsReadMutation.mutateAsync,
        acceptBoardInvitation: handleAccept,
        declineBoardInvitation: declineMutation.mutateAsync,
      }}
    >
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
