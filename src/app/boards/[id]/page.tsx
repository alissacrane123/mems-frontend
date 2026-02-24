'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import JournalEntry from '@/components/JournalEntry';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import type { Board, Entry } from '@/types';
import { useEffect } from 'react';

export default function BoardPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const boardId = id as string;

  const {
    data: board,
    isPending: boardLoading,
    error: boardError,
  } = useQuery<Board>({
    queryKey: queryKeys.board(boardId),
    queryFn: () => api.getBoard(boardId),
    enabled: !!user && !!boardId,
  });

  const { data: boards = [] } = useQuery<Board[]>({
    queryKey: queryKeys.boards,
    queryFn: api.getBoards,
    enabled: !!user,
  });

  const {
    data: entries = [],
    isPending: entriesLoading,
  } = useQuery<Entry[]>({
    queryKey: queryKeys.entries(boardId),
    queryFn: () => api.getEntries(boardId),
    enabled: !!user && !!boardId,
  });

  const copyInviteLink = () => {
    if (board) {
      const inviteUrl = `${window.location.origin}/invite/${board.inviteCode}`;
      navigator.clipboard.writeText(inviteUrl);
    }
  };

  if (authLoading || boardLoading) {
    return <Spinner />;
  }

  if (boardError || !board) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {boardError?.message || 'Board not found'}
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
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="capitalize">{board.role}</span> •{" "}
            {entries.length} memories
          </div>
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

      <div className="space-y-6">
        {entriesLoading ? (
          <Spinner className="py-12" />
        ) : entries.length > 0 ? (
          entries.map((entry) => (
            <JournalEntry
              key={entry.id}
              entry={entry}
              isOwnPost={entry.userId === user?.id}
            />
          ))
        ) : (
          <EmptyState
            icon={
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="No memories yet"
            description="Start capturing precious moments for this board."
          />
        )}
      </div>
    </div>
  );
}
