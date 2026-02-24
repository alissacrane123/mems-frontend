'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const DEBOUNCE_MS = 1500;

interface UseAutoSaveOptions {
  onSave: () => Promise<void>;
}

export function useAutoSave({ onSave }: UseAutoSaveOptions) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const flush = useCallback(async () => {
    if (!dirty.current) return;
    dirty.current = false;
    setSaving(true);
    try {
      await onSaveRef.current();
      setLastSaved(new Date());
    } catch {
      // Silently fail — user sees stale "last saved" timestamp
    } finally {
      setSaving(false);
    }
  }, []);

  const trigger = useCallback(() => {
    dirty.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, DEBOUNCE_MS);
  }, [flush]);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        flush();
      }
    };
  }, [flush]);

  return { trigger, saving, lastSaved };
}
