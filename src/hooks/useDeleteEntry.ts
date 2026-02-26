import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useDeleteEntry(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => api.deleteEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entries(boardId) });
    },
  });
}
