"use client";

import { useState } from "react";
import type { Folder } from "@/types";
import { useRouter } from "next/navigation";
import { FolderIcon, CloseIcon } from "@/components/icons";
import { useDeleteFolder } from "@/hooks/useDeleteFolder";
import { shuffleColors } from "@/lib/constants";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

const folderColors = shuffleColors(0);

type FolderItemProps = {
  folder: Folder;
  index?: number;
  onDrop?: (data: { type: "note" | "folder"; id: string }, targetFolderId: string) => void;
};

export function FolderItem({ folder, index = 0, onDrop }: FolderItemProps) {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const deleteFolderMutation = useDeleteFolder();

  const accent = folderColors[index % folderColors.length]!;

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
        className={`relative flex items-center gap-3 min-w-[160px] px-4 py-3.5 rounded-xl rounded-l-lg border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-gray-800 cursor-pointer group transition-all duration-200 hover:border-gray-300 dark:hover:border-white/[0.14] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(10,15,25,0.08)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] ${
          dragOver ? "ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20" : ""
        }`}
      >
        <div
          className="absolute top-0 left-0 w-[3px] h-full rounded-l-xl"
          style={{ background: accent.dot }}
        />

        <button
          onClick={(e) => { e.stopPropagation(); setShowDelete(true); }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all cursor-pointer"
          title="Delete folder"
        >
          <CloseIcon />
        </button>

        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          // style={{ background: `${accent.dot}1a` }}
        >
          <FolderIcon className="w-9 h-9" fill={accent.dot} style={{ stroke: accent.dot }} />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {folder.name}
          </div>
        </div>
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
