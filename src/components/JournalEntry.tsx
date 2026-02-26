"use client";

import { useState } from "react";
import { formatTime } from "@/lib/format";
import type { Entry } from "@/types";
import { ACCENT_COLORS } from "@/lib/constants";
import { CloseIcon } from "@/components/icons";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

interface JournalEntryProps {
  entry: Entry;
  isOwnPost: boolean;
  index?: number;
  side?: "left" | "right";
  canDelete?: boolean;
  onDelete?: (entryId: string) => void;
  isDeleting?: boolean;
}

export default function JournalEntry({
  entry,
  isOwnPost,
  index = 0,
  side = "left",
  canDelete = false,
  onDelete,
  isDeleting = false,
}: JournalEntryProps) {
  const { content, createdAt, location, photos = [], createdByName } = entry;
  const [showConfirm, setShowConfirm] = useState(false);
  const time = formatTime(createdAt);
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length]!;
  const initial = (createdByName || "?").charAt(0).toUpperCase();
  const hasPhotos = photos.length > 0;

  const d = new Date(createdAt);
  const dayNum = d.getDate();
  const monthShort = d.toLocaleDateString("en-US", { month: "short" });
  const year = d.getFullYear();

  return (
    <div
      className={`flex items-start gap-0 relative ${side === "right" ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Card */}
      <div className="flex-1 min-w-0">
        <article
          // className={`rounded-2xl overflow-hidden border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-gray-800 transition-all duration-250 cursor-pointer group hover:border-gray-300 dark:hover:border-white/[0.13] hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(10,15,25,0.1)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] ${
          //   !hasPhotos ? "dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/80" : ""
          // }`}
          className={`rounded-2xl overflow-hidden border border-gray-200 dark:border-white/[0.07]  transition-all duration-250 cursor-pointer group hover:border-gray-300 dark:hover:border-white/[0.13] hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(10,15,25,0.1)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] ${
            !hasPhotos ? " dark:from-gray-800 dark:to-gray-800/80" : ""
          }`}
        >
          {/* <div className={`h-[2px] bg-gradient-to-r ${accent.gradient}`} /> */}
          <div className="p-5 relative">
            {canDelete && (
              <button
                onClick={() => setShowConfirm(true)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all cursor-pointer"
                title="Delete memory"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
            {/* Author row */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 bg-gradient-to-br ${accent.gradient}`}
              >
                {initial}
              </div>
              <span className="text-[13px] font-medium text-gray-900 dark:text-gray-100">
                {isOwnPost ? "You" : createdByName}
              </span>
              <span className="w-[3px] h-[3px] rounded-full bg-gray-300 dark:bg-gray-600" />
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {time}
              </span>
              {location && (
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto truncate max-w-[150px]">
                  📍 {location}
                </span>
              )}
            </div>

            {/* Photos */}
            {hasPhotos && (
              <div className="mb-3">
                <div
                  className={`grid gap-1.5 rounded-xl overflow-hidden ${
                    photos.length === 1 ? "grid-cols-1" : "grid-cols-2"
                  }`}
                >
                  {photos.map((photo, i) => (
                    <div
                      key={i}
                      // className="relative overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-[4/3]"

                      className="relative overflow-hidden  aspect-[4/3]"
                    >
                      <img
                        src={photo}
                        alt={`Memory photo ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {content && (
              <div
                className={`leading-relaxed whitespace-pre-wrap text-gray-900 dark:text-gray-100 ${
                  !hasPhotos
                    ? "text-[17px] dark:text-gray-200 leading-[1.7]"
                    : "text-sm"
                }`}
              >
                {content}
              </div>
            )}
          </div>
        </article>
      </div>

      {/* Timeline dot */}
      <div className="w-20 flex-shrink-0 flex justify-center items-start pt-5 relative z-10">
        <div
          className="w-2.5 h-2.5 rounded-full border-2 transition-transform duration-200 group-hover:scale-150"
          style={{
            borderColor: accent.dot,
            background: "var(--tw-bg-opacity, #f9fafb)",
          }}
        />
      </div>

      {/* Date side */}
      <div
        className={`flex-1 min-w-0 pt-5 hidden md:block ${side === "left" ? "text-left" : "text-right"}`}
      >
        <div className="text-xs italic text-gray-400 dark:text-gray-500 leading-snug">
          {monthShort} {dayNum}
          <br />
          {year}
        </div>
      </div>

      {canDelete && (
        <Modal
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          maxWidth="max-w-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Delete memory?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this memory? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onDelete?.(entry.id);
                setShowConfirm(false);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
