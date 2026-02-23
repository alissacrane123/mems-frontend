"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/lib/api";
import JournalEntry from "@/components/JournalEntry";
import AddMemoryForm from "@/components/AddMemoryForm";
import InviteMemberModal from "@/components/InviteMemberModal";
import Button from "@/components/Button";

interface Board {
  id: string;
  name: string;
  description: string | null;
  role: string;
  invite_code?: string;
}

interface Entry {
  id: string;
  content: string;
  date: string;
  time: string;
  location: string | null;
  photos: string[];
  created_by_name: string;
  user_id: string;
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    } else if (user) {
      loadUserBoards();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (selectedBoardId) {
      loadBoardEntries();
    }
  }, [selectedBoardId]);

  const loadUserBoards = async () => {
    try {
      const data = await api.getBoards();
      const boardsData: Board[] = (data || []).map((board: any) => ({
        id: board.id,
        name: board.name,
        description: board.description,
        role: board.role || "member",
        invite_code: board.invite_code,
      }));

      setBoards(boardsData);

      if (boardsData.length > 0 && !selectedBoardId) {
        setSelectedBoardId(boardsData[0].id);
      }
    } catch (err) {
      console.error("Error loading boards:", err);
    } finally {
      setLoadingBoards(false);
    }
  };

  const loadBoardEntries = async () => {
    if (!selectedBoardId) return;

    setLoadingEntries(true);
    try {
      const data = await api.getEntries(selectedBoardId);

      const formattedEntries: Entry[] = (data || []).map((entry: any) => {
        const createdAt = new Date(entry.created_at);
        return {
          id: entry.id,
          content: entry.content,
          date: createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: createdAt.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: entry.location,
          photos: entry.photos || [],
          created_by_name: entry.created_by_name || "Unknown",
          user_id: entry.user_id,
        };
      });

      setEntries(formattedEntries);
    } catch (err) {
      console.error("Error loading entries:", err);
    } finally {
      setLoadingEntries(false);
    }
  };

  const createNewBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      const data = await api.createBoard({ name: newBoardName.trim() });
      setNewBoardName("");
      setShowCreateBoard(false);
      await loadUserBoards();
      setSelectedBoardId(data.id);
    } catch (err) {
      console.error("Error creating board:", err);
    }
  };

  if (loading || loadingBoards) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (boards.length === 0) {
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
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first family board to start capturing precious
              memories.
            </p>
            <Button
              onClick={() => setShowCreateBoard(true)}
              variant="primary"
              size="lg"
            >
              Create Your First Board
            </Button>
          </div>
        </div>

        {showCreateBoard && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Create New Board
              </h2>
              <form onSubmit={createNewBoard} className="space-y-4">
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Enter board name..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <div className="flex space-x-3 pt-2">
                  <Button
                    type="submit"
                    disabled={!newBoardName.trim()}
                    variant="primary"
                    className="flex-1"
                  >
                    Create Board
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowCreateBoard(false)}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  return (
    <>
      <div className="space-y-8">
        {/* Board Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={selectedBoardId || ""}
                onChange={(e) => setSelectedBoardId(e.target.value)}
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
            {selectedBoard && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="capitalize">{selectedBoard.role}</span> •{" "}
                {entries.length} memories
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowCreateBoard(true)}
              variant="ghost"
            >
              New Board
            </Button>
            <Button
              onClick={() => setShowInviteModal(true)}
              disabled={!selectedBoardId}
              variant="secondary"
            >
              Invite Members
            </Button>
            <Button
              onClick={() => setShowAddMemory(true)}
              disabled={!selectedBoardId}
              variant="primary"
            >
              Add Memory
            </Button>
          </div>
        </div>

        {/* Create Board Modal */}
        {showCreateBoard && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Create New Board
              </h2>
              <form onSubmit={createNewBoard} className="space-y-4">
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Enter board name..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <div className="flex space-x-3 pt-2">
                  <Button
                    type="submit"
                    disabled={!newBoardName.trim()}
                    variant="primary"
                    className="flex-1"
                  >
                    Create Board
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowCreateBoard(false)}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invite Members Modal */}
        {showInviteModal && selectedBoard && (
          <InviteMemberModal
            boardId={selectedBoard.id}
            boardName={selectedBoard.name}
            onClose={() => setShowInviteModal(false)}
          />
        )}

        {/* Loading State for Entries */}
        {loadingEntries && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Entries */}
        {!loadingEntries && (
          <div className="space-y-6">
            {entries.length > 0
              ? entries.map((entry) => (
                  <JournalEntry
                    key={entry.id}
                    id={entry.id}
                    content={entry.content}
                    date={entry.date}
                    time={entry.time}
                    location={entry.location || ''}
                    photos={entry.photos}
                    createdByName={entry.created_by_name}
                    isOwnPost={entry.user_id === user?.id}
                  />
                ))
              : selectedBoardId && (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      No memories yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Start capturing precious moments for {selectedBoard?.name}
                      .
                    </p>
                    <Button
                      onClick={() => setShowAddMemory(true)}
                      variant="primary"
                      className="mt-4"
                    >
                      Add Your First Memory
                    </Button>
                  </div>
                )}
          </div>
        )}

        {/* Add Memory Form */}
        {showAddMemory && selectedBoardId && (
          <AddMemoryForm
            boardId={selectedBoardId}
            onSuccess={() => {
              setShowAddMemory(false);
              loadBoardEntries();
            }}
            onCancel={() => setShowAddMemory(false)}
          />
        )}
      </div>
    </>
  );
}
