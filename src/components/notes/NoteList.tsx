"use client";

import { useCallback } from "react";
import { useNotes } from "@/hooks/useNotes";
import { useFolders } from "@/hooks/useFolders";
import { useFolder } from "@/hooks/useFolder";
import { useUpdateNote } from "@/hooks/useUpdateNote";
import { useUpdateFolder } from "@/hooks/useUpdateFolder";
import type { Note, Folder } from "@/types";
import { NoteItem } from "./NoteItem";
import { FolderItem } from "./FolderItem";
import Spinner from "../Spinner";
import { NoteNux } from "./NoteNux";

interface NoteListProps {
  folderId?: string | null;
}

function FolderAndNoteGrid({ folders, notes }: { folders: Folder[]; notes: Note[] }) {
  const updateNote = useUpdateNote();
  const updateFolder = useUpdateFolder();

  const handleDrop = useCallback(
    (payload: { type: "note" | "folder"; id: string }, targetFolderId: string) => {
      if (payload.type === "note") {
        updateNote.mutate({ id: payload.id, data: { folderId: targetFolderId } });
      } else {
        updateFolder.mutate({ id: payload.id, data: { parentId: targetFolderId } });
      }
    },
    [updateNote, updateFolder]
  );

  if (folders.length === 0 && notes.length === 0) return <NoteNux />;

  return (
    <div className="flex flex-col gap-4">
      {folders.length > 0 && (
        <div className="flex flex-wrap gap-4 pb-4">
          {folders.map((f: Folder) => (
            <FolderItem key={f.id} folder={f} onDrop={handleDrop} />
          ))}
        </div>
      )}
      {folders.length > 0 && notes.length > 0 && (
        <div className="mx-4 w-full flex">
          <div className="w-full h-full border-b border-gray-200 dark:border-gray-700" />
        </div>
      )}
      {notes.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {notes.map((note: Note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}

function RootNoteList() {
  const { notes, loading: notesLoading } = useNotes();
  const { folders, loading: foldersLoading } = useFolders();

  if (notesLoading || foldersLoading) return <Spinner />;

  return <FolderAndNoteGrid folders={folders} notes={notes} />;
}

function FolderNoteList({ folderId }: { folderId: string }) {
  const { folder, loading } = useFolder(folderId);

  if (loading) return <Spinner />;

  const subfolders: Folder[] = (folder as any)?.subfolders ?? [];
  const notes: Note[] = (folder as any)?.notes ?? [];

  return <FolderAndNoteGrid folders={subfolders} notes={notes} />;
}

export function NoteList({ folderId }: NoteListProps = {}) {
  if (folderId) return <FolderNoteList folderId={folderId} />;
  return <RootNoteList />;
}
