import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; content?: string; folderId?: string } }) =>
      api.updateNote(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.note(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders });
    },
  });
}
