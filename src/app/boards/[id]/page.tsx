'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import JournalEntry from '@/components/JournalEntry';
import Button from '@/components/Button';

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
  const [boards, setBoards] = useState<BoardData[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    } else if (user && id) {
      loadBoardData();
      loadUserBoards();
    }
  }, [user, authLoading, id, router]);

  const loadUserBoards = async () => {
    try {
      const data = await api.getBoards();
      setBoards(data || []);
    } catch (err) {
      console.error('Error loading boards:', err);
    }
  };

  const loadBoardData = async () => {
    try {
      const boardData = await api.getBoard(id as string);

      setBoard({
        id: boardData.id,
        name: boardData.name,
        description: boardData.description,
        invite_code: boardData.invite_code,
        role: boardData.role || 'member',
        member_count: boardData.member_count || 0,
      });

      const entriesData = await api.getEntries(id as string);

      const formattedEntries: Entry[] = (entriesData || []).map((entry: any) => {
        const createdAt = new Date(entry.created_at);
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
          photos: entry.photos || [],
          created_by_name: entry.created_by_name || 'Unknown',
          user_id: entry.user_id,
        };
      });

      setEntries(formattedEntries);
    } catch (err: any) {
      console.error('Error loading board data:', err);
      setError(err.message || 'Failed to load board data');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (board) {
      const inviteUrl = `${window.location.origin}/invite/${board.invite_code}`;
      navigator.clipboard.writeText(inviteUrl);
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
        <Button
          onClick={() => router.push('/boards')}
          variant="ghost"
        >
          ← Back to Boards
        </Button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={id || ""}
              onChange={(e) => router.push(`/boards/${e.target.value}`)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          {board && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="capitalize">{board.role}</span> •{" "}
              {entries.length} memories
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={copyInviteLink}
            variant="ghost"
          >
            Copy Invite Link
          </Button>
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
