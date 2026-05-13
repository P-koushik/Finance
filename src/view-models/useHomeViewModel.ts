import { useCallback, useMemo, useState } from 'react';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useToast } from '../components/ToastProvider';
import { financeApi, financeQueryKeys } from '../services/finance-api';
import type { RootStackParamList } from '../types';
import { defaultProfile } from '../utils/profile';

export function useHomeViewModel() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const {
    data: expenses = [],
    isLoading: expensesLoading,
    refetch: refetchExpenses,
  } = useQuery({
    queryKey: financeQueryKeys.expenses,
    queryFn: financeApi.getExpenses,
  });
  const {
    data: profile = defaultProfile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: financeQueryKeys.profile,
    queryFn: financeApi.getProfile,
  });

  useFocusEffect(
    useCallback(() => {
      refetchExpenses();
      refetchProfile();
    }, [refetchExpenses, refetchProfile]),
  );

  const totalSpent = useMemo(
    () => expenses.reduce((total, expense) => total + expense.amount, 0),
    [expenses],
  );

  const topCategory = useMemo(() => {
    if (!expenses.length) return 'None';

    const totals = expenses.reduce<Record<string, number>>((acc, expense) => {
      const category = expense.category ?? 'Other';

      acc[category] = (acc[category] ?? 0) + expense.amount;

      return acc;
    }, {});

    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
  }, [expenses]);

  const deleteMutation = useMutation({
    mutationFn: financeApi.deleteExpense,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: financeQueryKeys.expenses,
      });
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
    if (!expenseToDelete) return;

    await deleteMutation.mutateAsync(expenseToDelete);
  };

  return {
    availableMoney: Math.max(profile.availableAmount - totalSpent, 0),
    confirmDelete,
    expenseToDelete,
    expenses,
    handleDelete: setExpenseToDelete,
    loading: expensesLoading || profileLoading,
    monthlyBudget: profile.monthlyBudget,
    navigation,
    savingsAmount: profile.savingsAmount,
    setExpenseToDelete,
    topCategory,
    totalSpent,
    visibleExpenses: expenses.slice(0, 10),
  };
}
