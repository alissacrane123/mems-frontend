import { PencilIcon } from "@/components/icons";

export function NoteNux() {
  return (
    <div className="text-center py-12">
      <PencilIcon />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        No notes yet
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Create your first note to start writing.
      </p>
    </div>
  );
}
