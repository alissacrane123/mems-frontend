import { useJoinBoardByInvite } from "@/hooks/useJoinBoard";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import Button from "../Button";
import Spinner from "../Spinner";

type JoinBoardFormProps = {
  onClose: () => void;
  onError: (error: string) => void;
};

export function JoinBoardForm({ onClose, onError }: JoinBoardFormProps) {
  const { user, loading: authLoading } = useAuth();
  const joinBoardMutation = useJoinBoardByInvite(user?.id ?? "");
  const [joinCode, setJoinCode] = useState("");
  const [_, setError] = useState("");

  const handleJoinBoard = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    joinBoardMutation.mutate(joinCode, {
      onSuccess: () => {
        setJoinCode("");
        onClose();
      },
      onError: (err) => {
        setError(err.message || "Failed to join board");
        onError(err.message || "Failed to join board");
      },
    });
  };

  if (authLoading) return <Spinner />;

  return (
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
              onClick={onClose}
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
  );
}
