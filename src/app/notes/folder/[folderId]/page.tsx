"use client";

import { useParams } from "next/navigation";
import NotesHeader from "@/components/notes/NotesHeader";
import { NoteList } from "@/components/notes/NoteList";

export default function NotesFolderPage() {
  const { folderId } = useParams<{ folderId: string }>();

  return (
    <div className="space-y-8">
      <NotesHeader folderId={folderId} />
      <NoteList folderId={folderId} />
    </div>
  );
}
