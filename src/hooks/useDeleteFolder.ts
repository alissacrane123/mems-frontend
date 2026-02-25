import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: "delete" | "move-up" }) =>
      api.deleteFolder(id, mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders });
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    },
  });
}
