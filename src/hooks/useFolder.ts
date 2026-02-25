"use client";

import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Folder } from "@/types";

export function useFolder(id: string | null) {
  const {
    data: folder,
    isPending: loading,
    error: queryError,
  } = useQuery<Folder>({
    queryKey: queryKeys.folder(id!),
    queryFn: () => api.getFolder(id!),
    enabled: !!id,
  });

  return {
    folder: folder ?? null,
    loading: id ? loading : false,
    error: queryError?.message ?? null,
  };
}
