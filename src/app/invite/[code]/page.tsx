'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface BoardInfo {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
}

export default function InvitePage() {
  const { code } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [board, setBoard] = useState<BoardInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadBoardInfo();
    }
  }, [authLoading, code]);

  const loadBoardInfo = async () => {
    try {
      // Find board by invite code
      const { data: boardData, error: boardError } = await supabase
        .from('boards')
        .select('id, name, description')
        .eq('invite_code', code)
        .single();

      if (boardError || !boardData) {
        setError('Invalid or expired invite link');
        setLoading(false);
        return;
      }

      // Get member count
      const { count } = await supabase
        .from('board_members')
        .select('*', { count: 'exact', head: true })
        .eq('board_id', boardData.id);

      setBoard({
        id: boardData.id,
        name: boardData.name,
        description: boardData.description,
        member_count: count || 0
      });

      // Check if user is already a member (if logged in)
      if (user) {
        const { data: memberData } = await supabase
          .from('board_members')
          .select('id')
          .eq('board_id', boardData.id)
          .eq('user_id', user.id)
          .single();

        if (memberData) {
          setAlreadyMember(true);
        }
      }
    } catch (err) {
      console.error('Error loading board info:', err);
      setError('Failed to load invite information');
    } finally {
      setLoading(false);
    }
  };

  const joinBoard = async () => {
    if (!user || !board) return;

    setJoining(true);
    setError('');

    try {
      const { error } = await supabase
        .from('board_members')
        .insert([{
          board_id: board.id,
          user_id: user.id,
          role: 'member'
        }]);

      if (error) throw error;

      router.push(`/boards/${board.id}`);
    } catch (err) {
      console.error('Error joining board:', err);
      setError('Failed to join board');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'Invite not found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This invite link may be invalid or expired.
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl mx-auto mb-4">
            FM
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            You're invited to join
          </h1>
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {board.name}
          </h2>
          {board.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {board.description}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {board.member_count} members
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4">
            <div className="text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          </div>
        )}

        {!user ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Sign in to join this family board
            </p>
            <button
              onClick={() => router.push('/auth')}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In / Sign Up
            </button>
          </div>
        ) : alreadyMember ? (
          <div className="space-y-3">
            <p className="text-sm text-green-700 dark:text-green-400 text-center">
              You're already a member of this board!
            </p>
            <button
              onClick={() => router.push(`/boards/${board.id}`)}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Board
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={joinBoard}
              disabled={joining}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {joining ? 'Joining...' : 'Join Board'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}