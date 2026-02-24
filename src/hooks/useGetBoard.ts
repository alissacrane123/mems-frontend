"use client";

import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Board } from "@/types";

export function useGetBoard(id: string | null) {
  const {
    data: board,
    isPending: loading,
    error: queryError,
  } = useQuery<Board>({
    queryKey: queryKeys.board(id!),
    queryFn: () => api.getBoard(id!),
    enabled: !!id,
  });

  return {
    board: board ?? null,
    loading: id ? loading : false,
    error: queryError?.message ?? null,
  };
}
