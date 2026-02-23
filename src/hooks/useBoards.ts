'use client';

import { useState, useEffect, useCallback } from 'react';
import * as api from '@/lib/api';
import type { Board } from '@/types';

interface UseBoardsOptions {
  autoSelect?: boolean;
}

export function useBoards({ autoSelect = true }: UseBoardsOptions = {}) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getBoards();
      const fetched: Board[] = (data || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        invite_code: b.invite_code ?? '',
        role: b.role || 'member',
        member_count: b.member_count ?? 0,
        created_at: b.created_at,
      }));
      setBoards(fetched);
      return fetched;
    } catch (err: any) {
      setError(err.message || 'Failed to load boards');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards().then((fetched) => {
      if (autoSelect && fetched.length > 0 && !selectedBoardId) {
        setSelectedBoardId(fetched[0].id);
      }
    });
  }, [fetchBoards, autoSelect]);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId) ?? null;

  const createBoard = useCallback(async (name: string) => {
    const data = await api.createBoard({ name });
    const fetched = await fetchBoards();
    if (fetched.length > 0) {
      setSelectedBoardId(data.id);
    }
    return data;
  }, [fetchBoards]);

  return {
    boards,
    selectedBoard,
    selectedBoardId,
    setSelectedBoardId,
    createBoard,
    reload: fetchBoards,
    loading,
    error,
  };
}
