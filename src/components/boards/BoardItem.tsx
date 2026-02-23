import type { Board } from '@/types';
import Button from '../Button';
import { useRouter } from 'next/navigation';

type BoardItemProps = {
  board: Board;
};

export function BoardItem({ board }: BoardItemProps) {
  const router = useRouter();

  const copyInviteLink = (inviteCode: string) => {
    const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
  };

  return (
    <div
      key={board.id}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {board.name}
          </h3>
          {board.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {board.description}
            </p>
          )}
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="capitalize">{board.role}</span>
            <span>{board.memberCount} members</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={() => router.push(`/boards/${board.id}`)}
          variant="primary"
          size="sm"
        >
          View Board
        </Button>
        <button
          onClick={() => copyInviteLink(board.inviteCode)}
          className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer active:scale-95"
          title="Copy invite link"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
