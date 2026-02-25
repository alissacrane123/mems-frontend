import type { Folder } from "@/types";
import { useRouter } from "next/navigation";

type FolderItemProps = {
  folder: Folder;
};

export function FolderItem({ folder }: FolderItemProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/notes/folder/${folder.id}`)}
      className="border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group w-28"
    >
      <svg
        className="h-12 w-12 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
      </svg>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate w-full">
        {folder.name}
      </span>
    </div>
  );
}
