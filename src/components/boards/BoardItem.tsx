"use client";

import type { Board } from "@/types";
import { useRouter } from "next/navigation";
import { ACCENT_COLORS } from "@/lib/constants";
import { getRelativeTime } from "@/lib/format";

type BoardItemProps = {
  board: Board;
  index: number;
};

export function BoardItem({ board, index }: BoardItemProps) {
  const router = useRouter();
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length]!;
  const initial = board.name.charAt(0).toUpperCase();

  return (
    <div
      onClick={() => router.push(`/boards/${board.id}`)}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group transition-all duration-250  hover:-translate-y-0.5 hover:shadow-[0_12px_20px_rgba(10,15,25,0.12)] dark:hover:shadow-[0_12px_20px_rgba(10,15,25,0.4)]"
    >
      <div className={`h-1.5 bg-gradient-to-r ${accent.gradient}`} />

      <div className="p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {board.name}
        </h3>

        {board.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {board.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${accent.bg} ${accent.text}`}
          >
            {board.role}
          </span>
          {board.memberCount > 1 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${accent.bg} ${accent.text}`}
            >
              Shared
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full bg-gradient-to-br ${accent.gradient} flex items-center justify-center text-[10px] font-bold text-white`}
            >
              {initial}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {board.memberCount}{" "}
              {board.memberCount === 1 ? "member" : "members"}
            </span>
          </div>

          {board.createdAt && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: accent.dot }}
              />
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {getRelativeTime(board?.updatedAt ?? "")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
