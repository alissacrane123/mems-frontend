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
      className="flex flex-col text-gray-400 items-center gap-2 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group w-28"
    >
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
        <path
          fill="none"
          d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
        />
      </svg>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate w-full">
        {folder.name}
      </span>
    </div>
  );
}
