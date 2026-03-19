import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useOptimisticMutation({
  queryKey,
  mutationFn,
  action = 'update', // 'create', 'update', 'delete'
  idField = 'id',
  onSuccessMessage,
  onErrorMessage = 'Operation failed',
  onSuccessCallback
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        
        if (action === 'create') {
          if (Array.isArray(old)) {
            if (Array.isArray(variables)) {
              const newItems = variables.map((v, i) => ({ ...v, [idField]: `temp-id-${Date.now()}-${i}` }));
              return [...newItems, ...old];
            }
            return [{ ...variables, [idField]: `temp-id-${Date.now()}` }, ...old];
          }
          return old;
        } else if (action === 'update') {
          const data = variables.data || variables;
          if (Array.isArray(old)) {
            const id = variables[idField] || variables.id;
            return old.map(item => 
              item[idField] === id ? { ...item, ...data } : item
            );
          } else if (typeof old === 'object' && old !== null) {
            return { ...old, ...data };
          }
        } else if (action === 'delete') {
          if (Array.isArray(old)) {
            const id = typeof variables === 'object' ? (variables[idField] || variables.id) : variables;
            return old.filter(item => item[idField] !== id);
          } else {
            return null;
          }
        }
        return old;
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (onErrorMessage) toast.error(onErrorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: (data, variables, context) => {
      if (onSuccessMessage) {
        toast.success(onSuccessMessage);
      }
      if (onSuccessCallback) {
        onSuccessCallback(data, variables, context);
      }
    }
  });
}