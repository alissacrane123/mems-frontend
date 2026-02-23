'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import Button from './Button';

interface InviteMemberModalProps {
  boardId: string;
  boardName: string;
  onClose: () => void;
}

export default function InviteMemberModal({ boardId, boardName, onClose }: InviteMemberModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !user) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const emailLower = email.toLowerCase().trim();

      if (emailLower === user.email?.toLowerCase()) {
        setError('You cannot invite yourself');
        setLoading(false);
        return;
      }

      const lookupData = await api.lookupByEmail(emailLower);

      if (!lookupData.exists) {
        setError('No user found with this email. They need to sign up first.');
        setLoading(false);
        return;
      }

      const targetUserId = lookupData.userId;

      const memberCheck = await api.checkIsMember(boardId, targetUserId);

      if (memberCheck.is_member) {
        setError('This user is already a member of the board');
        setLoading(false);
        return;
      }

      const inviteCheck = await api.checkInvite(targetUserId, boardId);

      if (inviteCheck.exists) {
        setError('An invitation has already been sent to this user');
        setLoading(false);
        return;
      }

      await api.createNotification({
        user_id: targetUserId,
        type: 'board_invitation',
        data: {
          board_id: boardId,
          board_name: boardName,
          invited_by_id: user.id,
          invited_by_email: user.email,
        },
      });

      setSuccess(true);
      setEmail('');

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error sending invitation:', err);
      setError(err.message || 'Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Invite to {boardName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Enter the email address of the person you want to invite. They must already have an account.
        </p>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 mb-4">
            <div className="text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 mb-4">
            <div className="text-sm text-green-700 dark:text-green-400">
              Invitation sent successfully!
            </div>
          </div>
        )}

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="family@example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              type="submit"
              disabled={loading || !email.trim() || success}
              variant="primary"
              className="flex-1"
            >
              {loading ? 'Sending...' : success ? 'Sent!' : 'Send Invitation'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
