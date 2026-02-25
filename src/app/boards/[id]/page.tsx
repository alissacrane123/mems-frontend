"use client";

import { useEffect, useState } from "react";
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

  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  if (authLoading || boardsLoading) return <Spinner />;
  if (!user) return null;

  const error = boardError || entriesError || boardsError;

  if (loading) return <Spinner />;

  if (!board && !loading) {
    return (
      <>
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2h12a2 2 0 012 2v2M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Welcome to Mems!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">sorry</p>
            <Button
              onClick={() => setShowCreateBoard(true)}
              variant="primary"
              size="lg"
            >
              Create Your First Board
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Board Selector + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={board?.id || ""}
              onChange={(e) => router.push(`/boards/${e.target.value}`)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          {board && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="capitalize">{board.role}</span> •{" "}
              {entries.length} memories
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowCreateBoard(true)} variant="ghost">
            New Board
          </Button>
          <Button
            onClick={() => setShowInviteModal(true)}
            disabled={!board?.id}
            variant="secondary"
          >
            Invite Members
          </Button>
          <Button
            onClick={() => setShowAddMemory(true)}
            disabled={!board?.id}
            variant="primary"
          >
            Add Memory
          </Button>
        </div>
      </div>

      {/* Timeline */}
      {!entriesLoading && entries.length > 0 && (
        <Timeline entries={entries} />
      )}

      {/* Entries */}
      {entriesLoading ? (
        <Spinner className="py-12" />
      ) : entries.length > 0 ? (
        <div className="space-y-6">
          {entries.map((entry, index) => {
            const d = new Date(entry.createdAt);
            const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
            return (
              <div key={entry.id} data-entry-month={monthKey}>
                <JournalEntry
                  entry={entry}
                  isOwnPost={entry.userId === user.id}
                  index={index}
                />
              </div>
            );
          })}
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
          boardId={board?.id}
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
