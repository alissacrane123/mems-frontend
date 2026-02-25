import type { Note } from "@/types";
import { useRouter } from "next/navigation";
import { formatDateShort } from "@/lib/format";
import { useDeleteNote } from "@/hooks/useDeleteNote";
import { CloseIcon, NotepadIcon } from "@/components/icons";

type NoteItemProps = {
  note: Note;
};

export function NoteItem({ note }: NoteItemProps) {
  const router = useRouter();
  const deleteNoteMutation = useDeleteNote();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this note?")) return;
    deleteNoteMutation.mutate(note.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "note", id: note.id }));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => router.push(`/notes/${note.id}`)}
      className="flex text-gray-400 flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group w-28 relative"
    >
      <button
        onClick={handleDelete}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
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
  );
}
