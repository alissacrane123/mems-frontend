'use client';

import { useQuery } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Entry } from '@/types';

export function useEntries(boardId: string | null) {
  const {
    data: entries = [],
    isPending: loading,
    error: queryError,
    refetch,
  } = useQuery<Entry[]>({
    queryKey: queryKeys.entries(boardId!),
    queryFn: () => api.getEntries(boardId!),
    enabled: !!boardId,
  });

  return {
    entries,
    loading: boardId ? loading : false,
    error: queryError?.message ?? null,
    reload: refetch,
  };
}
