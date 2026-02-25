"use client";

import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Board } from "@/types";
import { BoardItem } from "./BoardItem";
import Spinner from "../Spinner";
import { BoardNux } from "./BoardNux";

export function BoardList() {
  const { data: boards = [], isPending: loading } = useQuery<Board[]>({
    queryKey: queryKeys.boards,
    queryFn: api.getBoards,
  });

  if (loading) return <Spinner />;

  if (boards.length === 0) return <BoardNux />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {boards.map((board: Board, index: number) => (
        <BoardItem key={board.id} board={board} index={index} />
      ))}
    </div>
  );
}
