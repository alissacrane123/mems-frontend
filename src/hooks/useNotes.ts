'use client';

import { useQuery } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Note } from '@/types';

export function useNotes(folderId?: string | null) {
  const {
    data: notes = [],
    isPending: loading,
    error: queryError,
  } = useQuery<Note[]>({
    queryKey: [...queryKeys.notes, folderId ?? 'root'],
    queryFn: () => api.getNotes(folderId ?? undefined),
  });

  return {
    notes,
    loading,
    error: queryError?.message ?? null,
  };
}
