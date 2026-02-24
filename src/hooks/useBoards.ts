'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useCreateBoard } from './useCreateBoard';
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

  const createBoardMutation = useCreateBoard();

  const createBoard = async (name: string) => {
    const data = await createBoardMutation.mutateAsync({ name });
    setSelectedBoardId(data.id);
    return data;
  };

  return {
    boards,
    selectedBoard,
    selectedBoardId,
    setSelectedBoardId,
    createBoard,
    reload: () => queryClient.invalidateQueries({ queryKey: queryKeys.boards }),
    loading,
    error: queryError?.message ?? null,
  };
}
