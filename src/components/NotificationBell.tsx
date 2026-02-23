'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications, Notification } from '@/contexts/NotificationContext';

export default function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead, acceptBoardInvitation, declineBoardInvitation } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAcceptInvitation = async (notificationId: string, boardId: string) => {
    setAcceptingId(notificationId);
    const result = await acceptBoardInvitation(notificationId, boardId);
    setAcceptingId(null);

    if (result.success) {
      setIsOpen(false);
      router.push('/');
      router.refresh();
    } else {
      alert(result.error || 'Failed to accept invitation');
    }
  };

  const handleDeclineInvitation = async (notificationId: string) => {
    await declineBoardInvitation(notificationId);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
        aria-label="Notifications"
      >
        {/* Bell Icon */}
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[32rem] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  onAccept={handleAcceptInvitation}
                  onDecline={handleDeclineInvitation}
                  isAccepting={acceptingId === notification.id}
                  formatTimeAgo={formatTimeAgo}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Notification Item Component
interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onAccept: (notificationId: string, boardId: string) => void;
  onDecline: (notificationId: string) => void;
  isAccepting: boolean;
  formatTimeAgo: (date: string) => string;
}

function NotificationItem({ notification, onClick, onAccept, onDecline, isAccepting, formatTimeAgo }: NotificationItemProps) {
  const renderContent = () => {
    switch (notification.type) {
      case 'board_invitation':
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <span className="font-medium">{notification.data.invitedByEmail}</span> invited you to join{' '}
              <span className="font-medium">{notification.data.boardName}</span>
            </p>
            {!notification.isRead && (
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(notification.id, notification.data.boardId!);
                  }}
                  disabled={isAccepting}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer active:scale-95"
                >
                  {isAccepting ? 'Accepting...' : 'Accept'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDecline(notification.id);
                  }}
                  disabled={isAccepting}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors cursor-pointer active:scale-95"
                >
                  Decline
                </button>
              </div>
            )}
            {notification.isRead && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You declined this invitation
              </p>
            )}
          </div>
        );

      case 'new_memory':
        return (
          <p className="text-sm text-gray-900 dark:text-gray-100">
            <span className="font-medium">{notification.data.createdByEmail}</span> added a new memory to{' '}
            <span className="font-medium">{notification.data.boardName}</span>
          </p>
        );

      case 'user_joined':
        return (
          <p className="text-sm text-gray-900 dark:text-gray-100">
            <span className="font-medium">{notification.data.userEmail}</span> joined{' '}
            <span className="font-medium">{notification.data.boardName}</span>
          </p>
        );

      default:
        return (
          <p className="text-sm text-gray-900 dark:text-gray-100">
            New notification
          </p>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {renderContent()}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <div className="ml-2 flex-shrink-0">
            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
