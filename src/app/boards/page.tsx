"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { BoardList } from "@/components/boards/BoardList";
import { JoinBoardForm } from "@/components/boards/JoinBoardForm";
import { CreateBoardForm } from "@/components/boards/CreateBoardForm";

// NOTE NOT USED ANYMORE, WILL BE REMOVED SOON

export default function BoardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

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
        <CreateBoardForm
          onClose={() => setShowCreateForm(false)}
          onError={setError}
        />
      )}

      {/* Join Board Form */}
      {showJoinForm && (
        <JoinBoardForm
          onClose={() => setShowJoinForm(false)}
          onError={setError}
        />
      )}

      <BoardList />
    </div>
  );
}
