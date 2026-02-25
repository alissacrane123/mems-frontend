import type { Folder } from "@/types";
import { useRouter } from "next/navigation";
import { FolderIcon } from "@/components/icons";

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
      <FolderIcon />
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate w-full">
        {folder.name}
      </span>
    </div>
  );
}
