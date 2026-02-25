import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; parentId?: string } }) =>
      api.updateFolder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders });
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    },
  });
}
