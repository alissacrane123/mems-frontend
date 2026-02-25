import { useState } from "react";
import type { Note } from "@/types";
import { useRouter } from "next/navigation";
import { formatDateShort } from "@/lib/format";
import { useDeleteNote } from "@/hooks/useDeleteNote";
import { CloseIcon, NotepadIcon } from "@/components/icons";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

type NoteItemProps = {
  note: Note;
};

export function NoteItem({ note }: NoteItemProps) {
  const router = useRouter();
  const deleteNoteMutation = useDeleteNote();
  const [showConfirm, setShowConfirm] = useState(false);

  const openConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleDelete = () => {
    deleteNoteMutation.mutate(note.id, {
      onSuccess: () => setShowConfirm(false),
    });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "note", id: note.id }));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onClick={() => router.push(`/notes/${note.id}`)}
        className="flex text-gray-400 flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group w-28 relative"
      >
        <button
          onClick={openConfirm}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all cursor-pointer"
          title="Delete note"
        >
          <CloseIcon />
        </button>
        <NotepadIcon />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate w-full">
          {note.title}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">
          {formatDateShort(note.updatedAt)}
        </span>
      </div>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} maxWidth="max-w-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Delete note?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <span className="font-medium">&ldquo;{note.title}&rdquo;</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleteNoteMutation.isPending}>
            {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
