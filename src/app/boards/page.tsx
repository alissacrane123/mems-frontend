'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Board {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_at: string;
  role: string;
  member_count: number;
}

export default function BoardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [newBoard, setNewBoard] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    } else if (user) {
      loadBoards();
    }
  }, [user, authLoading, router]);

  const loadBoards = async () => {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select(`
          id,
          name,
          description,
          invite_code,
          created_at,
          board_members!inner (
            role,
            user_id
          )
        `)
        .eq('board_members.user_id', user?.id);

      if (error) throw error;

      // Get member counts for each board
      const boardsWithCounts = await Promise.all(
        (data || []).map(async (board) => {
          const { count } = await supabase
            .from('board_members')
            .select('*', { count: 'exact', head: true })
            .eq('board_id', board.id);

          return {
            id: board.id,
            name: board.name,
            description: board.description,
            invite_code: board.invite_code,
            created_at: board.created_at,
            role: board.board_members[0]?.role || 'member',
            member_count: count || 0
          };
        })
      );

      setBoards(boardsWithCounts);
    } catch (err) {
      console.error('Error loading boards:', err);
      setError('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data, error } = await supabase
        .from('boards')
        .insert([{
          name: newBoard.name,
          description: newBoard.description,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setNewBoard({ name: '', description: '' });
      setShowCreateForm(false);
      loadBoards();
    } catch (err) {
      console.error('Error creating board:', err);
      setError('Failed to create board');
    }
  };

  const joinBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // First, find the board by invite code
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .select('id')
        .eq('invite_code', joinCode.trim())
        .single();

      if (boardError || !board) {
        setError('Invalid invite code');
        return;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('board_members')
        .select('id')
        .eq('board_id', board.id)
        .eq('user_id', user?.id)
        .single();

      if (existingMember) {
        setError('You are already a member of this board');
        return;
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('board_members')
        .insert([{
          board_id: board.id,
          user_id: user?.id,
          role: 'member'
        }]);

      if (memberError) throw memberError;

      setJoinCode('');
      setShowJoinForm(false);
      loadBoards();
    } catch (err) {
      console.error('Error joining board:', err);
      setError('Failed to join board');
    }
  };

  const copyInviteLink = (inviteCode: string) => {
    const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    // TODO: Show success toast
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Family Boards
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your family memory boards and collaborations
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowJoinForm(true)}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            Join Board
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Board
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Create Board Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Create New Board
            </h3>
            <form onSubmit={createBoard} className="space-y-4">
              <div>
                <label htmlFor="boardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Board Name
                </label>
                <input
                  id="boardName"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Smith Family Memories"
                  value={newBoard.name}
                  onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="boardDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="boardDescription"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="A place to capture our family's precious moments"
                  value={newBoard.description}
                  onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Board Form */}
      {showJoinForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Join Board
            </h3>
            <form onSubmit={joinBoard} className="space-y-4">
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Invite Code
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter invite code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinForm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Join Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Boards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board) => (
          <div
            key={board.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {board.name}
                </h3>
                {board.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {board.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="capitalize">{board.role}</span>
                  <span>{board.member_count} members</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/boards/${board.id}`)}
                className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                View Board
              </button>
              <button
                onClick={() => copyInviteLink(board.invite_code)}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Copy invite link"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {boards.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2h12a2 2 0 012 2v2M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No boards yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create your first family board or join an existing one.
          </p>
        </div>
      )}
    </div>
  );
}