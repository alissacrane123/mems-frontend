'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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

      // Check if trying to invite themselves
      if (emailLower === user.email?.toLowerCase()) {
        setError('You cannot invite yourself');
        setLoading(false);
        return;
      }

      // Lookup user by email
      const lookupResponse = await fetch('/api/users/lookup-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower })
      });

      const lookupData = await lookupResponse.json();

      if (!lookupData.exists) {
        setError('No user found with this email. They need to sign up first.');
        setLoading(false);
        return;
      }

      const targetUserId = lookupData.userId;

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('board_members')
        .select('id')
        .eq('board_id', boardId)
        .eq('user_id', targetUserId)
        .single();

      if (existingMember) {
        setError('This user is already a member of the board');
        setLoading(false);
        return;
      }

      // Check if invitation already sent (unread notification exists)
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('type', 'board_invitation')
        .eq('is_read', false)
        .contains('data', { board_id: boardId })
        .single();

      if (existingNotification) {
        setError('An invitation has already been sent to this user');
        setLoading(false);
        return;
      }

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: targetUserId,
          type: 'board_invitation',
          data: {
            board_id: boardId,
            board_name: boardName,
            invited_by_id: user.id,
            invited_by_email: user.email
          }
        }]);

      if (notificationError) throw notificationError;

      setSuccess(true);
      setEmail('');

      // Auto-close after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError('Failed to send invitation. Please try again.');
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
            <button
              type="submit"
              disabled={loading || !email.trim() || success}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : success ? 'Sent!' : 'Send Invitation'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
