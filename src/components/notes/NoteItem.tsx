import { useState } from "react";
import type { Note } from "@/types";
import { useRouter } from "next/navigation";
import { formatDateShort } from "@/lib/format";
import { useDeleteNote } from "@/hooks/useDeleteNote";
import { CloseIcon, NotepadIcon } from "@/components/icons";
import { shuffleColors } from "@/lib/constants";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

const noteColors = shuffleColors(97);

type NoteItemProps = {
  note: Note;
  index?: number;
};

export function NoteItem({ note, index = 0 }: NoteItemProps) {
  const router = useRouter();
  const deleteNoteMutation = useDeleteNote();
  const [showConfirm, setShowConfirm] = useState(false);

  const accent = noteColors[index % noteColors.length]!;

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
        className="relative overflow-hidden flex items-center gap-3 min-w-[160px] px-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-gray-800 cursor-pointer group transition-all duration-200 hover:border-gray-300 dark:hover:border-white/[0.14] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(10,15,25,0.08)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)]"
      >
        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${accent.gradient}`} />

        <button
          onClick={openConfirm}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all cursor-pointer"
          title="Delete note"
        >
          <CloseIcon />
        </button>

        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent.dot}1a` }}
        >
          <NotepadIcon className="w-5 h-5" fill={accent.dot} style={{ stroke: accent.dot }} />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {note.title}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500">
            {formatDateShort(note.updatedAt)}
          </div>
        </div>
      </div>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} maxWidth="max-w-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Delete note?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <span className="font-medium">&ldquo;{note.title}&rdquo;</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="primary" onClick={handleDelete} disabled={deleteNoteMutation.isPending}>
            {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
