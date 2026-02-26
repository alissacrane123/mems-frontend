"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBoards } from "@/hooks/useBoards";
import { useEntries } from "@/hooks/useEntries";
import JournalEntry from "@/components/JournalEntry";
import AddMemoryForm from "@/components/AddMemoryForm";
import InviteMemberModal from "@/components/InviteMemberModal";
import CreateBoardModal from "@/components/CreateBoardModal";
import EmptyState from "@/components/EmptyState";
import Spinner from "@/components/Spinner";
import Button from "@/components/Button";
import Timeline from "@/components/Timeline";
import { useGetBoard } from "@/hooks/useGetBoard";
import { useDeleteEntry } from "@/hooks/useDeleteEntry";
import { ChevronLeftIcon } from "@/components/icons";

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

import type { Entry } from "@/types";

interface MonthGroup {
  key: string;
  label: string;
  entries: { entry: Entry; globalIndex: number }[];
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { board, loading, error: boardError } = useGetBoard(id);

  const {
    boards,
    createBoard,
    loading: boardsLoading,
    error: boardsError,
  } = useBoards();

  const {
    entries,
    loading: entriesLoading,
    error: entriesError,
    reload: reloadEntries,
  } = useEntries(id);

  const deleteEntryMutation = useDeleteEntry(id);

  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const isOwner = board?.role === "owner";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

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

  const boardCreatedDate = board?.createdAt
    ? (() => {
        const d = new Date(board.createdAt);
        return `${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      })()
    : null;

  if (authLoading || boardsLoading) return <Spinner />;
  if (!user) return null;

  const error = boardError || entriesError || boardsError;

  if (loading) return <Spinner />;

  if (!board && !loading) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Board not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This board doesn&apos;t exist or you don&apos;t have access.
          </p>
          <Button onClick={() => router.push("/")} variant="primary">
            Back to Boards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-6">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Board Hero */}
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
            <h1 className="text-4xl  font-semibold text-gray-900 dark:text-white tracking-tight mb-2">
              {board?.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>
                {board?.memberCount}{" "}
                {board?.memberCount === 1 ? "member" : "members"}
              </span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span>
                {entries.length} {entries.length === 1 ? "memory" : "memories"}
              </span>
              {boardCreatedDate && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span>Since {boardCreatedDate}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowInviteModal(true)}
              disabled={!board?.id}
              variant="ghost"
            >
              Invite
            </Button>
            <Button
              onClick={() => setShowAddMemory(true)}
              disabled={!board?.id}
              variant="primary"
            >
              + Add Memory
            </Button>
          </div>
        </div>
      </div>

      {/* Divider */}
      {/* <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-6" /> */}

      {/* Timeline month nav */}
      {!entriesLoading && entries.length > 0 && <Timeline entries={entries} />}

      {/* Entries Timeline */}
      {entriesLoading ? (
        <Spinner className="py-12" />
      ) : entries.length > 0 ? (
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
                    isOwnPost={entry.userId === user.id}
                    index={globalIndex}
                    side={entry.userId === user.id ? "right" : "left"}
                    canDelete={isOwner || entry.userId === user.id}
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
              onClick={() => setShowAddMemory(true)}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 text-sm font-medium cursor-pointer transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
            >
              <span className="w-7 h-7 rounded-full border border-dashed border-current flex items-center justify-center text-base transition-transform duration-200 hover:rotate-90">
                +
              </span>
              Add a memory
            </button>
          </div>
        </div>
      ) : (
        board?.id && (
          <EmptyState
            icon={
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            title="No memories yet"
            description={`Start capturing precious moments for ${board?.name}.`}
            action={
              <Button onClick={() => setShowAddMemory(true)} variant="primary">
                Add Your First Memory
              </Button>
            }
          />
        )
      )}

      {/* Modals */}
      <CreateBoardModal
        open={showCreateBoard}
        onClose={() => setShowCreateBoard(false)}
        onCreated={async (name) => {
          await createBoard(name);
          setShowCreateBoard(false);
        }}
      />

      {showInviteModal && board && (
        <InviteMemberModal
          boardId={board.id}
          boardName={board.name}
          onClose={() => setShowInviteModal(false)}
          inviteCode={board.inviteCode}
        />
      )}

      {showAddMemory && board?.id && (
        <AddMemoryForm
          boardId={board.id}
          onSuccess={() => {
            setShowAddMemory(false);
            reloadEntries();
          }}
          onCancel={() => setShowAddMemory(false)}
        />
      )}
    </div>
  );
}
