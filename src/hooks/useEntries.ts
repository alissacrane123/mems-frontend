'use client';

import { useState, useEffect, useCallback } from 'react';
import * as api from '@/lib/api';
import type { Entry } from '@/types';

export function useEntries(boardId: string | null) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!boardId) {
      setEntries([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.getEntries(boardId);
      const fetched: Entry[] = (data || []).map((e: any) => ({
        id: e.id,
        content: e.content,
        createdAt: e.createdAt,
        location: e.location,
        userId: e.userId,
        createdByName: e.createdByName || 'Unknown',
        photos: e.photos || [],
      }));
      setEntries(fetched);
    } catch (err: any) {
      setError(err.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return {
    entries,
    loading,
    error,
    reload: fetchEntries,
  };
}
