import type { Note } from '@/types';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/format';
import { useDeleteNote } from '@/hooks/useDeleteNote';

type NoteItemProps = {
  note: Note;
};

export function NoteItem({ note }: NoteItemProps) {
  const router = useRouter();
  const deleteNoteMutation = useDeleteNote();

  const preview = note.content
    ? note.content.slice(0, 120).replace(/\n/g, ' ')
    : 'Empty note';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this note?')) return;
    deleteNoteMutation.mutate(note.id);
  };

  return (
    <div
      onClick={() => router.push(`/notes/${note.id}`)}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate flex-1">
          {note.title}
        </h3>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
          title="Delete note"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
        {preview}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {formatDate(note.updatedAt)}
      </p>
    </div>
  );
}
