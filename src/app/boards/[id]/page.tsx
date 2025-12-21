'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import JournalEntry from '@/components/JournalEntry';

interface BoardData {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  role: string;
  member_count: number;
}

interface Entry {
  id: string;
  content: string;
  date: string;
  time: string;
  location: string | null;
  photos: string[];
  created_by_name: string;
  user_id: string;
}

export default function BoardPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [board, setBoard] = useState<BoardData | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    } else if (user && id) {
      loadBoardData();
    }
  }, [user, authLoading, id, router]);

  const loadBoardData = async () => {
    try {
      // Load board info and check permissions
      const { data: boardData, error: boardError } = await supabase
        .from('boards')
        .select(`
          id,
          name,
          description,
          invite_code,
          board_members!inner (
            role,
            user_id
          )
        `)
        .eq('id', id)
        .eq('board_members.user_id', user?.id)
        .single();

      if (boardError) {
        setError('Board not found or access denied');
        setLoading(false);
        return;
      }

      // Get member count
      const { count } = await supabase
        .from('board_members')
        .select('*', { count: 'exact', head: true })
        .eq('board_id', id);

      setBoard({
        id: boardData.id,
        name: boardData.name,
        description: boardData.description,
        invite_code: boardData.invite_code,
        role: boardData.board_members[0]?.role || 'member',
        member_count: count || 0
      });

      // Load entries for this board
      const { data: entriesData, error: entriesError } = await supabase
        .from('entries')
        .select(`
          id,
          content,
          created_at,
          location,
          user_id,
          photos (
            file_path,
            display_order
          ),
          profiles!user_id (
            first_name
          )
        `)
        .eq('board_id', id)
        .order('created_at', { ascending: false });

      if (entriesError) throw entriesError;

      // Format entries to match the component interface
      const formattedEntries: Entry[] = (entriesData || []).map(entry => {
        const createdAt = new Date(entry.created_at);
        const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;

        return {
          id: entry.id,
          content: entry.content,
          date: createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          time: createdAt.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          location: entry.location,
          photos: (entry.photos || [])
            .sort((a, b) => a.display_order - b.display_order)
            .map(photo => photo.file_path),
          created_by_name: profile?.first_name || 'Unknown',
          user_id: entry.user_id,
        };
      });

      setEntries(formattedEntries);
    } catch (err) {
      console.error('Error loading board data:', err);
      setError('Failed to load board data');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (board) {
      const inviteUrl = `${window.location.origin}/invite/${board.invite_code}`;
      navigator.clipboard.writeText(inviteUrl);
      // TODO: Show success toast
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {error || 'Board not found'}
        </h1>
        <button
          onClick={() => router.push('/boards')}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Boards
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Board Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <button
              onClick={() => router.push('/boards')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {board.name}
            </h1>
          </div>
          {board.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {board.description}
            </p>
          )}
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="capitalize">{board.role}</span>
            <span>{board.member_count} members</span>
            <span>{entries.length} memories</span>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={copyInviteLink}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            Copy Invite Link
          </button>
          {/* TODO: Add "Add Memory" button */}
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-6">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <JournalEntry
              key={entry.id}
              id={entry.id}
              content={entry.content}
              date={entry.date}
              time={entry.time}
              location={entry.location || ''}
              photos={entry.photos}
              createdByName={entry.created_by_name}
              isOwnPost={entry.user_id === user?.id}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No memories yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start capturing precious moments for this board.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}