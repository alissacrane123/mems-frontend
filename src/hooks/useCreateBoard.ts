import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.createBoard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
    },
  });
}
