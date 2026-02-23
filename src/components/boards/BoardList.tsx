import type { Board } from "@/types";
import { BoardItem } from "./BoardItem";

type BoardListProps = {
  boards: Board[];
};

export function BoardList({ boards }: BoardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {boards.map((board: Board) => (
        <BoardItem key={board.id} board={board} />
      ))}
    </div>
  );
}
