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

  const sorted = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="flex flex-wrap gap-4">
      {folders.map((folder: Folder) => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
      {sorted.map((note: Note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </div>
  );
}

function FolderNoteList({ folderId }: { folderId: string }) {
  const { folder, loading } = useFolder(folderId);

  if (loading) return <Spinner />;

  const subfolders: Folder[] = (folder as any)?.subfolders ?? [];
  const notes: Note[] = (folder as any)?.notes ?? [];

  if (subfolders.length === 0 && notes.length === 0) return <NoteNux />;

  const sorted = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="flex flex-wrap gap-4">
      {subfolders.map((f: Folder) => (
        <FolderItem key={f.id} folder={f} />
      ))}
      {sorted.map((note: Note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </div>
  );
}

export function NoteList({ folderId }: NoteListProps = {}) {
  if (folderId) return <FolderNoteList folderId={folderId} />;
  return <RootNoteList />;
}
