'use client';

import { useQuery } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Note } from '@/types';

export function useNotes() {
  const {
    data: notes = [],
    isPending: loading,
    error: queryError,
  } = useQuery<Note[]>({
    queryKey: queryKeys.notes,
    queryFn: api.getNotes,
  });

  return {
    notes,
    loading,
    error: queryError?.message ?? null,
  };
}
