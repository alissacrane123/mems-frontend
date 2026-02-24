"use client";

import { useNotes } from "@/hooks/useNotes";
import type { Note } from "@/types";
import { NoteItem } from "./NoteItem";
import Spinner from "../Spinner";
import { NoteNux } from "./NoteNux";

export function NoteList() {
  const { notes, loading } = useNotes();

  if (loading) return <Spinner />;

  if (notes.length === 0) return <NoteNux />;

  const sorted = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((note: Note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </div>
  );
}
