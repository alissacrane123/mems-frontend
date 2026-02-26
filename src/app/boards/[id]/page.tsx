"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBoards } from "@/hooks/useBoards";
import { useEntries } from "@/hooks/useEntries";
import AddMemoryForm from "@/components/AddMemoryForm";
import InviteMemberModal from "@/components/InviteMemberModal";
import CreateBoardModal from "@/components/CreateBoardModal";
import EmptyState from "@/components/EmptyState";
import Spinner from "@/components/Spinner";
import Button from "@/components/Button";
import Timeline from "@/components/Timeline";
import { useGetBoard } from "@/hooks/useGetBoard";
import { FrownIcon } from "@/components/icons";
import { BoardNotFound } from "@/components/boards/BoardNotFound";
import { BoardDetailHeader } from "@/components/boards/BoardDetailHeader";
import { EntryList } from "@/components/boards/EntryList";

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

  const isOwner = board?.role === "owner";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

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
    return <BoardNotFound />;
  }

  return (
    <div>
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-6">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Board Hero */}
      <BoardDetailHeader
        boardId={id}
        boardName={board?.name ?? ""}
        memberCount={board?.memberCount ?? 0}
        entryCount={entries.length}
        boardCreatedDate={boardCreatedDate}
        onInvite={() => setShowInviteModal(true)}
        onAddMemory={() => setShowAddMemory(true)}
      />

      {/* Divider */}
      {/* <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-6" /> */}

      {entriesLoading && <Spinner className="py-12" />}
      {!entriesLoading && entries.length === 0 && (
        <EmptyState
          icon={<FrownIcon className="h-12 w-12 text-gray-400" />}
          title="No memories yet"
          description={`Start capturing precious moments for ${board?.name}.`}
          action={
            <Button onClick={() => setShowAddMemory(true)} variant="primary">
              Add Your First Memory
            </Button>
          }
        />
      )}
      {/* Entries timeline */}
      {!entriesLoading && entries.length > 0 && <Timeline entries={entries} />}

      {!entriesLoading && entries.length > 0 && (
        <EntryList
          boardId={id}
          entries={entries}
          userId={user.id}
          isOwner={isOwner}
          onAddMemory={() => setShowAddMemory(true)}
        />
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
