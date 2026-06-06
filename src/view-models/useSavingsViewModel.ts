import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useToast } from '../components/ToastProvider';
import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import { defaultProfile } from '../utils/profile';

export type SavingsAction = 'deposit' | 'withdraw';

export function useSavingsViewModel() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [action, setAction] = useState<SavingsAction>('deposit');
  const [amount, setAmount] = useState('');
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
  const availableMoney = Math.max(profile.balance - totalSpent, 0);
  const parsedAmount = useMemo(
    () => Number(amount.replace(/,/g, '')),
    [amount],
  );
  const isDeposit = action === 'deposit';
  const loading = expensesLoading || profileLoading;

  const savingsMutation = useMutation({
    mutationFn: () =>
      isDeposit
        ? financeApi.addToSavings(parsedAmount)
        : financeApi.withdrawFromSavings(parsedAmount),
    onSuccess: async nextProfile => {
      queryClient.setQueryData(financeQueryKeys.profile, nextProfile);
      await queryClient.invalidateQueries({
        queryKey: financeQueryKeys.profile,
      });
      setAmount('');
      showToast({
        type: 'success',
        title: isDeposit ? 'Savings updated' : 'Savings withdrawn',
        message: isDeposit
          ? 'Money moved from available to savings.'
          : 'Money moved from savings to available.',
      });
    },
  });

  const handleSubmit = async () => {
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid amount',
        message: 'Enter a positive amount.',
      });
      return false;
    }

    if (isDeposit && parsedAmount > availableMoney) {
      showToast({
        type: 'error',
        title: 'Not enough available money',
        message: 'Choose an amount within your available balance.',
      });
      return false;
    }

    if (!isDeposit && parsedAmount > profile.savings) {
      showToast({
        type: 'error',
        title: 'Not enough savings',
        message: 'Choose an amount within your savings balance.',
      });
      return false;
    }

    await savingsMutation.mutateAsync();
    return true;
  };

  return {
    action,
    amount,
    availableMoney,
    canSubmit: parsedAmount > 0 && !savingsMutation.isPending && !loading,
    handleSubmit,
    isDeposit,
    loading,
    parsedAmount,
    profile,
    saving: savingsMutation.isPending,
    setAction,
    setAmount,
  };
}
