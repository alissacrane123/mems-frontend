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
    <div className="flex flex-col gap-6">
      {folders.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
            Folders
          </div>
          <div className="flex flex-wrap gap-3">
            {folders.map((f: Folder, i: number) => (
              <FolderItem key={f.id} folder={f} index={i} onDrop={handleDrop} />
            ))}
          </div>
        </div>
      )}
      {notes.length > 0 && (
        <div>
          {folders.length > 0 && (
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
              Notes
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {notes.map((note: Note, i: number) => (
              <NoteItem key={note.id} note={note} index={i} />
            ))}
          </div>
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
