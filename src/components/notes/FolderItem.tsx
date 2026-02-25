"use client";

import { useState } from "react";
import type { Folder } from "@/types";
import { useRouter } from "next/navigation";
import { FolderIcon, CloseIcon } from "@/components/icons";
import { useDeleteFolder } from "@/hooks/useDeleteFolder";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

type FolderItemProps = {
  folder: Folder;
  onDrop?: (data: { type: "note" | "folder"; id: string }, targetFolderId: string) => void;
};

export function FolderItem({ folder, onDrop }: FolderItemProps) {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const deleteFolderMutation = useDeleteFolder();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "folder", id: folder.id }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    try {
      const payload = JSON.parse(e.dataTransfer.getData("application/json"));
      if (payload.id === folder.id) return;
      onDrop?.(payload, folder.id);
    } catch {}
  };

  const handleDelete = (mode: "delete" | "move-up") => {
    deleteFolderMutation.mutate(
      { id: folder.id, mode },
      { onSuccess: () => setShowDelete(false) }
    );
  };

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => router.push(`/notes/folder/${folder.id}`)}
        className={`flex flex-col text-gray-400 items-center gap-2 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group w-28 relative ${
          dragOver ? "ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20" : ""
        }`}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setShowDelete(true); }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all cursor-pointer"
          title="Delete folder"
        >
          <CloseIcon />
        </button>
        <FolderIcon />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate w-full">
          {folder.name}
        </span>
      </div>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} maxWidth="max-w-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Delete &ldquo;{folder.name}&rdquo;?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choose how to handle the contents of this folder.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete("delete")}
            disabled={deleteFolderMutation.isPending}
          >
            Delete folder and all its contents
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDelete("move-up")}
            disabled={deleteFolderMutation.isPending}
          >
            Delete folder and move contents up
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDelete(false)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
