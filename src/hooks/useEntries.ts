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
        created_at: e.created_at,
        location: e.location,
        user_id: e.user_id,
        created_by_name: e.created_by_name || 'Unknown',
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
