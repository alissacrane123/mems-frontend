"use client";

import { useMemo } from "react";
import type { Entry } from "@/types";
import JournalEntry from "@/components/JournalEntry";
import { useDeleteEntry } from "@/hooks/useDeleteEntry";

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthGroup {
  key: string;
  label: string;
  entries: { entry: Entry; globalIndex: number }[];
}

interface EntryListProps {
  boardId: string;
  entries: Entry[];
  userId: string;
  isOwner: boolean;
  onAddMemory: () => void;
}

export function EntryList({ boardId, entries, userId, isOwner, onAddMemory }: EntryListProps) {
  const deleteEntryMutation = useDeleteEntry(boardId);

  const monthGroups = useMemo(() => {
    const groups: MonthGroup[] = [];
    const map = new Map<string, MonthGroup>();
    entries.forEach((entry, i) => {
      const d = new Date(entry.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) {
        const group: MonthGroup = {
          key,
          label: `${FULL_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
          entries: [],
        };
        map.set(key, group);
        groups.push(group);
      }
      map.get(key)!.entries.push({ entry, globalIndex: i });
    });
    return groups;
  }, [entries]);

  return (
    <div className="relative max-w-[900px] mx-auto py-10">
      {/* Vertical timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-gray-700 to-transparent -translate-x-1/2 hidden md:block" />

      {monthGroups.map((group) => (
        <div key={group.key}>
          {/* Month marker */}
          <div
            className="text-center relative z-10 mb-9"
            data-entry-month={group.key}
          >
            <div className="inline-flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 px-5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 opacity-50" />
              <span className="text-sm text-blue-500 dark:text-blue-400">
                {group.label}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 opacity-50" />
            </div>
          </div>

          {/* Entries */}
          {group.entries.map(({ entry, globalIndex }) => (
            <div
              key={entry.id}
              className="mb-10"
              data-entry-month={group.key}
            >
              <JournalEntry
                entry={entry}
                isOwnPost={entry.userId === userId}
                index={globalIndex}
                side={entry.userId === userId ? "right" : "left"}
                canDelete={isOwner || entry.userId === userId}
                onDelete={(entryId) => deleteEntryMutation.mutate(entryId)}
                isDeleting={deleteEntryMutation.isPending}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Add memory CTA */}
      <div className="text-center pt-6 relative z-10">
        <button
          onClick={onAddMemory}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 text-sm font-medium cursor-pointer transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
        >
          <span className="w-7 h-7 rounded-full border border-dashed border-current flex items-center justify-center text-base transition-transform duration-200 hover:rotate-90">
            +
          </span>
          Add a memory
        </button>
      </div>
    </div>
  );
}
