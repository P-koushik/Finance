import { useCallback, useState } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useToast } from '../components/ToastProvider';
import { expensesApi as financeApi } from '../hooks/expenses-api';
import { financeQueryKeys } from '../hooks/finance-query-keys';
import type { RootStackParamList } from '../types';

export function useAllExpensesViewModel() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const {
    data: expenses = [],
    isLoading: loading,
    isRefetching: refreshing,
    refetch,
  } = useQuery({
    queryKey: financeQueryKeys.expenses,
    queryFn: financeApi.getExpenses,
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const deleteMutation = useMutation({
    mutationFn: financeApi.deleteExpense,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.expenses,
        }),
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.profile,
        }),
      ]);
      setExpenseToDelete(null);
      showToast({
        type: 'success',
        title: 'Expense deleted',
        message: 'The transaction was removed from your tracker.',
      });
    },
    onError: () => {
      showToast({
        type: 'error',
        title: 'Delete failed',
        message: 'The transaction could not be removed. Please try again.',
      });
    },
  });

  const confirmDelete = async () => {
    if (!expenseToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(expenseToDelete);
  };

  return {
    confirmDelete,
    expenseToDelete,
    expenses,
    handleDelete: setExpenseToDelete,
    loading,
    navigation,
    refresh,
    refreshing,
    setExpenseToDelete,
  };
}
