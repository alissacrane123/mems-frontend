"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useCreateNote } from "@/hooks/useCreateNote";
import Button from "@/components/Button";
import { NoteList } from "@/components/notes/NoteList";

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const createNoteMutation = useCreateNote();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const handleNewNote = () => {
    createNoteMutation.mutate(
      {},
      {
        onSuccess: (data) => {
          router.push(`/notes/${data.id}`);
        },
      }
    );
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your personal notebooks
          </p>
        </div>
        <Button
          onClick={handleNewNote}
          variant="primary"
          disabled={createNoteMutation.isPending}
        >
          {createNoteMutation.isPending ? "Creating..." : "New Note"}
        </Button>
      </div>

      <NoteList />
    </div>
  );
}
