import type { Note } from '@/types';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/format';
import { useDeleteNote } from '@/hooks/useDeleteNote';
import { TrashIcon } from '@/components/icons';

type NoteItemProps = {
  note: Note;
};

export function NoteItem({ note }: NoteItemProps) {
  const router = useRouter();
  const deleteNoteMutation = useDeleteNote();

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
          <TrashIcon />
        </button>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {formatDate(note.updatedAt)}
      </p>
    </div>
  );
}
