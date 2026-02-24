"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import Button from "@/components/Button";
import type { Board } from "@/types";
import { BoardList } from "@/components/boards/BoardList";

export default function BoardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [newBoard, setNewBoard] = useState({ name: "", description: "" });
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const {
    data: boards = [],
    isPending: loading,
  } = useQuery<Board[]>({
    queryKey: queryKeys.boards,
    queryFn: api.getBoards,
    enabled: !!user,
  });

  const createBoardMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.createBoard(data),
    onSuccess: () => {
      setNewBoard({ name: "", description: "" });
      setShowCreateForm(false);
      setError("");
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to create board");
    },
  });

  const joinBoardMutation = useMutation({
    mutationFn: async (code: string) => {
      const board = await api.getBoardByInviteCode(code.trim());
      if (!board || !board.id) {
        throw new Error("Invalid invite code");
      }
      const memberCheck = await api.checkIsMember(board.id, user!.id);
      if (memberCheck.isMember) {
        throw new Error("You are already a member of this board");
      }
      await api.joinBoard(board.id, user!.id);
    },
    onSuccess: () => {
      setJoinCode("");
      setShowJoinForm(false);
      setError("");
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to join board");
    },
  });

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createBoardMutation.mutate({
      name: newBoard.name,
      description: newBoard.description || undefined,
    });
  };

  const handleJoinBoard = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    joinBoardMutation.mutate(joinCode);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Family Boards
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your family memory boards and collaborations
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowJoinForm(true)} variant="ghost">
            Join Board
          </Button>
          <Button onClick={() => setShowCreateForm(true)} variant="primary">
            Create Board
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
        </div>
      )}

      {/* Create Board Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Create New Board
            </h3>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label
                  htmlFor="boardName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Board Name
                </label>
                <input
                  id="boardName"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Smith Family Memories"
                  value={newBoard.name}
                  onChange={(e) =>
                    setNewBoard({ ...newBoard, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="boardDescription"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description (optional)
                </label>
                <textarea
                  id="boardDescription"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="A place to capture our family's precious moments"
                  value={newBoard.description}
                  onChange={(e) =>
                    setNewBoard({ ...newBoard, description: e.target.value })
                  }
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createBoardMutation.isPending}
                  variant="primary"
                  className="flex-1"
                >
                  {createBoardMutation.isPending ? "Creating..." : "Create Board"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Board Form */}
      {showJoinForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Join Board
            </h3>
            <form onSubmit={handleJoinBoard} className="space-y-4">
              <div>
                <label
                  htmlFor="inviteCode"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Invite Code
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter invite code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowJoinForm(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={joinBoardMutation.isPending}
                  variant="primary"
                  className="flex-1"
                >
                  {joinBoardMutation.isPending ? "Joining..." : "Join Board"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
  
      {/* Boards List */}

      <BoardList boards={boards} />

      {boards.length === 0 && (
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2h12a2 2 0 012 2v2M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No boards yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create your first family board or join an existing one.
          </p>
        </div>
      )}
    </div>
  );
}
