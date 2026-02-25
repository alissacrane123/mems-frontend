"use client";

import { useNotes } from "@/hooks/useNotes";
import { useFolders } from "@/hooks/useFolders";
import { useFolder } from "@/hooks/useFolder";
import type { Note, Folder } from "@/types";
import { NoteItem } from "./NoteItem";
import { FolderItem } from "./FolderItem";
import Spinner from "../Spinner";
import { NoteNux } from "./NoteNux";

interface NoteListProps {
  folderId?: string | null;
}

function RootNoteList() {
  const { notes, loading: notesLoading } = useNotes();
  const { folders, loading: foldersLoading } = useFolders();

  if (notesLoading || foldersLoading) return <Spinner />;

  if (folders.length === 0 && notes.length === 0) return <NoteNux />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 pb-4">
        {folders.map((f: Folder) => (
          <FolderItem key={f.id} folder={f} />
        ))}
      </div>
      <div className="mx-4 w-full flex">
        <div className="w-full h-full border-b border-gray-200 dark:border-gray-700"/>
      </div>
      <div className="flex flex-wrap gap-4">
        {notes.map((note: Note) => (
          <NoteItem key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}

function FolderNoteList({ folderId }: { folderId: string }) {
  const { folder, loading } = useFolder(folderId);

  if (loading) return <Spinner />;

  const subfolders: Folder[] = (folder as any)?.subfolders ?? [];
  const notes: Note[] = (folder as any)?.notes ?? [];

  if (subfolders.length === 0 && notes.length === 0) return <NoteNux />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        {subfolders.map((f: Folder) => (
          <FolderItem key={f.id} folder={f} />
        ))}
      </div>
      <div className="mx-4 w-full">
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700"/>
      </div>
      <div className="flex flex-wrap gap-4">
        {notes.map((note: Note) => (
          <NoteItem key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}

export function NoteList({ folderId }: NoteListProps = {}) {
  if (folderId) return <FolderNoteList folderId={folderId} />;
  return <RootNoteList />;
}
