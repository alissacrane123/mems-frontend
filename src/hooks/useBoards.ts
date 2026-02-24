'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Board } from '@/types';

interface UseBoardsOptions {
  autoSelect?: boolean;
}

export function useBoards({ autoSelect = true }: UseBoardsOptions = {}) {
  const queryClient = useQueryClient();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  const {
    data: boards = [],
    isPending: loading,
    error: queryError,
  } = useQuery<Board[]>({
    queryKey: queryKeys.boards,
    queryFn: api.getBoards,
  });

  useEffect(() => {
    if (autoSelect && boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0].id);
    }
  }, [autoSelect, boards, selectedBoardId]);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId) ?? null;

  const createBoardMutation = useMutation({
    mutationFn: (name: string) => api.createBoard({ name }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.boards });
      setSelectedBoardId(data.id);
    },
  });

  return {
    boards,
    selectedBoard,
    selectedBoardId,
    setSelectedBoardId,
    createBoard: createBoardMutation.mutateAsync,
    reload: () => queryClient.invalidateQueries({ queryKey: queryKeys.boards }),
    loading,
    error: queryError?.message ?? null,
  };
}
