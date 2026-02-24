"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Note } from "@/types";
import Spinner from "@/components/Spinner";

const DEBOUNCE_MS = 1500;

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [initialized, setInitialized] = useState(false);

  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  titleRef.current = title;
  contentRef.current = content;

  const { data: note, isPending: loading } = useQuery<Note>({
    queryKey: queryKeys.note(id),
    queryFn: () => api.getNote(id),
    enabled: !!id && !!user,
  });

  useEffect(() => {
    if (note && !initialized) {
      setTitle(note.title);
      setContent(note.content ?? "");
      setInitialized(true);
    }
  }, [note, initialized]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const save = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.updateNote(id, {
        title: titleRef.current || "Untitled Note",
        content: contentRef.current,
      });
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    } catch {
      // Silently fail — user will see stale "last saved" timestamp
    } finally {
      setSaving(false);
    }
  }, [id, queryClient]);

  const debouncedSave = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(save, DEBOUNCE_MS);
  }, [save]);

  // Save on unmount if there's a pending debounce
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        save();
      }
    };
  }, [save]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    debouncedSave();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    debouncedSave();
  };

  // Auto-resize the textarea to fill the viewport
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!user || loading) return <Spinner />;

  if (!note) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Note not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between py-3 mb-2">
        <button
          onClick={() => router.push("/notes")}
          className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Notes
        </button>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {saving
            ? "Saving..."
            : lastSaved
              ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
              : ""}
        </span>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled Note"
        className="text-3xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none w-full placeholder-gray-300 dark:placeholder-gray-600 mb-4"
      />

      {/* Content — blank sheet textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing..."
        className="flex-1 w-full text-base text-gray-800 dark:text-gray-200 bg-transparent border-none outline-none resize-none leading-relaxed placeholder-gray-300 dark:placeholder-gray-600"
        style={{ minHeight: "60vh" }}
      />
    </div>
  );
}
