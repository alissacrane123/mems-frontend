"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useInviteMember } from "@/hooks/useInviteMember";
import Button from "./Button";
import Input from "./Input";
import Modal from "./Modal";

interface InviteMemberModalProps {
  boardId: string;
  boardName: string;
  onClose: () => void;
  inviteCode?: string;
}

export default function InviteMemberModal({
  boardId,
  boardName,
  onClose,
  inviteCode,
}: InviteMemberModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inviteMutation = useInviteMember();

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !user) return;
    setError("");
    setSuccess(false);
    inviteMutation.mutate(
      {
        email,
        boardId,
        boardName,
        inviterId: user.id,
        inviterEmail: user.email,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setEmail("");
          setError("");
          setTimeout(() => {
            onClose();
          }, 1500);
        },
        onError: (err: Error) => {
          setError(
            err.message || "Failed to send invitation. Please try again.",
          );
        },
      },
    );
  };

  return (
    <Modal open onClose={onClose}>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Invite to {boardName}
      </h3>

      <div className="flex items-center gap-3 mb-4">
        <label
          htmlFor="inviteCode"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
        >
          Invite Code
        </label>
        <Input
          id="inviteCode"
          required
          value={inviteCode}
          autoFocus
          disabled
          className="flex-1"
          copyable
        />
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Enter the email address of the person you want to invite. They must
        already have an account.
      </p>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 mb-4">
          <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 mb-4">
          <div className="text-sm text-green-700 dark:text-green-400">
            Invitation sent successfully!
          </div>
        </div>
      )}

      <form onSubmit={handleInvite} className="space-y-4">
        <div className="pb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email address
          </label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="family@example.com"
            autoFocus
          />
        </div>

        <div className="flex space-x-3 pt-2">
          <Button
            type="submit"
            disabled={inviteMutation.isPending || !email.trim() || success}
            variant="primary"
            className="flex-1"
          >
            {inviteMutation.isPending
              ? "Sending..."
              : success
                ? "Sent!"
                : "Send Invitation"}
          </Button>
          <Button type="button" onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
