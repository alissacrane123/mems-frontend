import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

interface CreateEntryInput {
  boardId: string;
  content: string;
  location?: string;
  files: File[];
}

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, content, location, files }: CreateEntryInput) => {
      const entry = await api.createEntry(boardId, {
        content,
        location,
      });

      if (files.length > 0) {
        await Promise.all(
          files.map((file, index) => api.uploadPhoto(entry.id, file, index))
        );
      }

      return entry;
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entries(boardId) });
    },
  });
}
