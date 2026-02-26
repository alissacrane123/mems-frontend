"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon, CameraExportIcon } from "@/components/icons";
import Button from "@/components/Button";
import * as api from "@/lib/api";

interface BoardDetailHeaderProps {
  boardId: string;
  boardName: string;
  memberCount: number;
  entryCount: number;
  boardCreatedDate: string | null;
  onInvite: () => void;
  onAddMemory: () => void;
}

export function BoardDetailHeader({
  boardId,
  boardName,
  memberCount,
  entryCount,
  boardCreatedDate,
  onInvite,
  onAddMemory,
}: BoardDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
      >
        <ChevronLeftIcon className="h-3 w-3" />
        Back to Boards
      </button>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-white tracking-tight mb-2">
            {boardName}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span>
              {entryCount} {entryCount === 1 ? "memory" : "memories"}
            </span>
            {boardCreatedDate && (
              <>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span>Since {boardCreatedDate}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <a
            href={api.exportBoardPhotos(boardId)}
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer"
            title="Export photos"
          >
            <CameraExportIcon />
          </a>
          <Button onClick={onInvite} variant="ghost">
            Invite
          </Button>
          <Button onClick={onAddMemory} variant="primary">
            + Add Memory
          </Button>
        </div>
      </div>
    </div>
  );
}
