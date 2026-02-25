"use client";

import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Folder } from "@/types";

export function useFolders(folderId?: string | null) {
  const {
    data: folders = [],
    isPending: loading,
    error: queryError,
  } = useQuery<Folder[]>({
    queryKey: [...queryKeys.folders, folderId ?? "root"],
    queryFn: () => api.getFolders(folderId ?? undefined),
  });

  return {
    folders: folders ?? [],
    loading,
    error: queryError?.message ?? null,
  };
}
