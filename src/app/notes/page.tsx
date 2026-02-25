"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import NotesHeader from "@/components/notes/NotesHeader";
import { NoteList } from "@/components/notes/NoteList";

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <NotesHeader />
      <NoteList />
    </div>
  );
}
