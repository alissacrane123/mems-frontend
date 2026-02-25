"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { JoinBoardForm } from "@/components/boards/JoinBoardForm";
import { CreateBoardForm } from "@/components/boards/CreateBoardForm";

export function BoardsHeader() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Boards
          </h1>
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

      {showCreateForm && (
        <CreateBoardForm
          onClose={() => setShowCreateForm(false)}
          onError={setError}
        />
      )}

      {showJoinForm && (
        <JoinBoardForm
          onClose={() => setShowJoinForm(false)}
          onError={setError}
        />
      )}
    </div>
  );
}
