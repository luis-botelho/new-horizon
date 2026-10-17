import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchEditais, moveEdital } from './api';
import type { Edital } from './schemas';
import type { EditalId, KanbanStage } from '@/shared/types/domain';

export const editaisKeys = {
  all: ['editais'] as const,
  list: () => [...editaisKeys.all, 'list'] as const,
};

export function useEditais() {
  return useQuery({
    queryKey: editaisKeys.list(),
    queryFn: fetchEditais,
    staleTime: 60_000,
  });
}

/** Move com atualização otimista e rollback se o servidor recusar. */
export function useMoveEdital() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, to }: { id: EditalId; to: KanbanStage }) => moveEdital(id, to),
    onMutate: async ({ id, to }) => {
      await qc.cancelQueries({ queryKey: editaisKeys.all });
      const previous = qc.getQueryData<Edital[]>(editaisKeys.list());
      qc.setQueryData<Edital[]>(editaisKeys.list(), (old) =>
        old?.map((e) => (e.id === id ? { ...e, stage: to } : e)),
      );
      return { previous };
    },
    onError: (_error, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(editaisKeys.list(), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: editaisKeys.all }),
  });
}
