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
          return [{ ...variables, [idField]: `temp-id-${Date.now()}` }, ...old];
        } else if (action === 'update') {
          const id = variables[idField] || variables.id;
          const data = variables.data || variables;
          return old.map(item => 
            item[idField] === id ? { ...item, ...data } : item
          );
        } else if (action === 'delete') {
          const id = typeof variables === 'object' ? (variables[idField] || variables.id) : variables;
          return old.filter(item => item[idField] !== id);
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