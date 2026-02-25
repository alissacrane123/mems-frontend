"use client";

import { useState } from "react";
import type { Folder } from "@/types";
import { useRouter } from "next/navigation";
import { FolderIcon } from "@/components/icons";

type FolderItemProps = {
  folder: Folder;
  onDrop?: (data: { type: "note" | "folder"; id: string }, targetFolderId: string) => void;
};

export function FolderItem({ folder, onDrop }: FolderItemProps) {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);

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

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => router.push(`/notes/folder/${folder.id}`)}
      className={`flex flex-col text-gray-400 items-center gap-2 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group w-28 ${
        dragOver ? "ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
    >
      <FolderIcon />
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate w-full">
        {folder.name}
      </span>
    </div>
  );
}
