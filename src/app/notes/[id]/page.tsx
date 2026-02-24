"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAutoSave } from "@/hooks/useAutoSave";
import type { Note } from "@/types";
import Spinner from "@/components/Spinner";
import NoteEditor from "@/components/notes/NoteEditor";

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [initialized, setInitialized] = useState(false);
  const titleRef = useRef(title);
  titleRef.current = title;

  // The editor component exposes a getter so we can read its HTML at save time
  const getContentRef = useRef<(() => string) | null>(null);

  const { data: note, isPending: loading } = useQuery<Note>({
    queryKey: queryKeys.note(id),
    queryFn: () => api.getNote(id),
    enabled: !!id && !!user,
  });

  const {
    trigger: debouncedSave,
    saving,
    lastSaved,
  } = useAutoSave({
    onSave: async () => {
      if (!id) return;
      await api.updateNote(id, {
        title: titleRef.current || "Untitled Note",
        content: getContentRef.current?.() ?? "",
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    },
  });

  useEffect(() => {
    if (note && !initialized) {
      setTitle(note.title);
      setInitialized(true);
    }
  }, [note, initialized]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      debouncedSave();
    },
    [debouncedSave],
  );

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
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
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

      {/* Editor + toolbar */}
      <NoteEditor
        initialContent={note.content ?? ""}
        onDirty={debouncedSave}
        getContentRef={getContentRef}
      />
    </div>
  );
}
