"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateNote } from "@/hooks/useCreateNote";
import { useCreateFolder } from "@/hooks/useCreateFolder";
import Button from "@/components/Button";
import { useFolder } from "@/hooks/useFolder";
import { ChevronLeftIcon } from "@/components/icons";

interface NotesHeaderProps {
  title?: string;
  subtitle?: string;
  folderId?: string;
}

export default function NotesHeader({
  title = "Notes",
  subtitle = "",
  folderId,
}: NotesHeaderProps) {
  const router = useRouter();
  const createNoteMutation = useCreateNote();
  const createFolderMutation = useCreateFolder();
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [folderName, setFolderName] = useState("");

  const { folder } = useFolder(folderId ?? null);

  const handleNewNote = () => {
    createNoteMutation.mutate(
      { folderId },
      {
        onSuccess: (data) => {
          router.push(`/notes/${data.id}`);
        },
      }
    );
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    createFolderMutation.mutate(
      { name: folderName.trim(), parentId: folderId },
      {
        onSuccess: () => {
          setFolderName("");
          setShowFolderInput(false);
        },
      }
    );
  };

  const handleBack = () => {
    if (folder?.parentId) {
      router.push(`/notes/folder/${folder.parentId}`);
    } else {
      router.push("/notes");
    }
  };

  return (
    <div className="space-y-4">
      {folderId && (
        <button
          onClick={handleBack}
          className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {folder?.name ?? title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowFolderInput(true)}
            variant="ghost"
            disabled={createFolderMutation.isPending}
          >
            New Folder
          </Button>
          <Button
            onClick={handleNewNote}
            variant="primary"
            disabled={createNoteMutation.isPending}
          >
            {createNoteMutation.isPending ? "Creating..." : "New Note"}
          </Button>
        </div>
      </div>

      {showFolderInput && (
        <form onSubmit={handleCreateFolder} className="flex items-center gap-3">
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Folder name..."
            autoFocus
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!folderName.trim() || createFolderMutation.isPending}
          >
            {createFolderMutation.isPending ? "Creating..." : "Create"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => { setShowFolderInput(false); setFolderName(""); }}
          >
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
}
