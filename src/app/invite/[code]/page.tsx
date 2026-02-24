'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import Button from '@/components/Button';
import type { BoardInfo } from '@/types';

export default function InvitePage() {
  const { code } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const inviteCode = code as string;

  const {
    data: board,
    isPending: boardLoading,
    error: boardError,
  } = useQuery<BoardInfo>({
    queryKey: queryKeys.boardByInvite(inviteCode),
    queryFn: () => api.getBoardByInviteCode(inviteCode),
    enabled: !authLoading,
  });

  const { data: memberCheck } = useQuery<{ isMember: boolean }>({
    queryKey: queryKeys.memberCheck(board?.id ?? '', user?.id ?? ''),
    queryFn: () => api.checkIsMember(board!.id, user!.id),
    enabled: !!board?.id && !!user?.id,
  });

  const alreadyMember = memberCheck?.isMember ?? false;

  const joinBoardMutation = useMutation({
    mutationFn: () => api.joinBoard(board!.id, user!.id),
    onSuccess: () => {
      router.push(`/boards/${board!.id}`);
    },
  });

  const loading = authLoading || boardLoading;
  const error = boardError?.message || (joinBoardMutation.error?.message ?? '');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (boardError || !board) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {boardError?.message || 'Invite not found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This invite link may be invalid or expired.
          </p>
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
          >
            Go to Home
          </Button>
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
            {board.memberCount} members
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
            <Button
              onClick={() => router.push('/auth')}
              variant="primary"
              className="w-full"
            >
              Sign In / Sign Up
            </Button>
          </div>
        ) : alreadyMember ? (
          <div className="space-y-3">
            <p className="text-sm text-green-700 dark:text-green-400 text-center">
              You're already a member of this board!
            </p>
            <Button
              onClick={() => router.push(`/boards/${board.id}`)}
              variant="primary"
              className="w-full"
            >
              View Board
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={() => joinBoardMutation.mutate()}
              disabled={joinBoardMutation.isPending}
              variant="primary"
              className="w-full"
            >
              {joinBoardMutation.isPending ? 'Joining...' : 'Join Board'}
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="secondary"
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
