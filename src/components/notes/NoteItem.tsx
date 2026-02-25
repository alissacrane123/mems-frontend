import type { Note } from "@/types";
import { useRouter } from "next/navigation";
import { formatDateShort } from "@/lib/format";
import { useDeleteNote } from "@/hooks/useDeleteNote";

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

  return (
    <div
      onClick={() => router.push(`/notes/${note.id}`)}
      className="flex text-gray-400 flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group w-28 relative"
    >
      <button
        onClick={handleDelete}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
        title="Delete note"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="40"
        height="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 2v4m4-4v4m4-4v4" />
        <rect width="16" height="18" x="4" y="4" rx="2" />
        <path d="M8 10h6m-6 4h8m-8 4h5" />
      </svg>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate w-full">
        {note.title}
      </span>
      <span className="text-[10px] text-gray-400 dark:text-gray-500">
        {formatDateShort(note.updatedAt)}
      </span>
    </div>
  );
}
