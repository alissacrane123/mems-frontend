"use client";

import { useState } from "react";
import { useCreateBoard } from "@/hooks/useCreateBoard";
import Button from "../Button";

type CreateBoardFormProps = {
  onClose: () => void;
  onError: (error: string) => void;
};

export function CreateBoardForm({ onClose, onError }: CreateBoardFormProps) {
  const [newBoard, setNewBoard] = useState({ name: "", description: "" });
  const createBoardMutation = useCreateBoard();

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    createBoardMutation.mutate(
      { name: newBoard.name, description: newBoard.description || undefined },
      {
        onSuccess: () => {
          setNewBoard({ name: "", description: "" });
          onClose();
        },
        onError: (err) => {
          onError(err.message || "Failed to create board");
        },
      },
    );
  };

  return (
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
              onClick={onClose}
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
  );
}
