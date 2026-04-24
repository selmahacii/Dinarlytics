import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrService, Employee } from '@/services/modules/hrService';

export const useEmployees = () => {
  const queryClient = useQueryClient();

  const {
    data: employees = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['employees'],
    queryFn: hrService.getAllEmployees,
    staleTime: 60000,
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) => hrService.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  return {
    employees,
    loading,
    error: error ? (error as Error).message : null,
    refresh: refetch,
    updateEmployee: (id: string, data: Partial<Employee>) => updateEmployeeMutation.mutateAsync({ id, data })
  };
};
