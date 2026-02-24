export const queryKeys = {
  boards: ['boards'] as const,
  board: (id: string) => ['boards', id] as const,
  boardByInvite: (code: string) => ['boards', 'invite', code] as const,
  entries: (boardId: string) => ['entries', boardId] as const,
  notifications: ['notifications'] as const,
  session: ['session'] as const,
  memberCheck: (boardId: string, userId: string) =>
    ['memberCheck', boardId, userId] as const,
  notes: ['notes'] as const,
  note: (id: string) => ['notes', id] as const,
};
