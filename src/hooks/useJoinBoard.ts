import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useJoinBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, userId }: { boardId: string; userId: string }) =>
      api.joinBoard(boardId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
    },
  });
}

export function useJoinBoardByInvite(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const board = await api.getBoardByInviteCode(code.trim());
      if (!board || !board.id) {
        throw new Error('Invalid invite code');
      }
      const memberCheck = await api.checkIsMember(board.id, userId);
      if (memberCheck.isMember) {
        throw new Error('You are already a member of this board');
      }
      await api.joinBoard(board.id, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
    },
  });
}
