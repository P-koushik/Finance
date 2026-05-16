import { useEffect, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateData } from 'react-native-calendars';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useToast } from '../components/ToastProvider';
import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { ExpenseCategory, RootStackParamList } from '../types';
import { formatDateKey, formatDateTime } from '../utils/format';

type EditExpenseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditExpense'
>;

const standardCategories: ExpenseCategory[] = ['Food', 'Travel', 'Utilities'];

const getSafeDate = (date: Date | string) => {
  const nextDate = date instanceof Date ? date : new Date(date);

  return Number.isNaN(nextDate.getTime()) ? new Date() : nextDate;
};

export function useEditExpenseViewModel({
  navigation,
  route,
}: EditExpenseScreenProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const expenseId = route.params.expenseId;

  const {
    data: expense,
    isError,
    isLoading: loadingExpense,
  } = useQuery({
    queryKey: financeQueryKeys.expense(expenseId),
    queryFn: () => financeApi.getExpense(expenseId),
  });

  useEffect(() => {
    if (!expense) {
      return;
    }

    const storedCategory = expense.category ?? 'Other';

    setTitle(expense.title);
    setAmount(String(expense.amount));
    setSelectedDate(getSafeDate(expense.date));

    if (standardCategories.includes(storedCategory as ExpenseCategory)) {
      setCategory(storedCategory as ExpenseCategory);
      setCustomCategory('');
    } else {
      setCategory('Other');
      setCustomCategory(storedCategory === 'Other' ? '' : storedCategory);
    }
  }, [expense]);

  useEffect(() => {
    if (!isError) {
      return;
    }

    showToast({
      type: 'error',
      title: 'Transaction not found',
      message: 'This transaction may have already been removed.',
    });
    navigation.goBack();
  }, [isError, navigation, showToast]);

  const parsedAmount = useMemo(
    () => Number(amount.replace(/,/g, '')),
    [amount],
  );
  const selectedCategory =
    category === 'Other' ? customCategory.trim() : category;

  const updateMutation = useMutation({
    mutationFn: () =>
      financeApi.updateExpense(expenseId, {
        title: title.trim(),
        amount: parsedAmount,
        category: selectedCategory,
        date: selectedDate.toISOString(),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.expenses,
        }),
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.expense(expenseId),
        }),
      ]);
      showToast({
        type: 'success',
        title: 'Transaction updated',
        message: 'Your changes were saved.',
      });
      navigation.goBack();
    },
    onError: () => {
      showToast({
        type: 'error',
        title: 'Update failed',
        message: 'The transaction could not be saved. Please try again.',
      });
    },
  });

  const canSave =
    Boolean(expense) &&
    title.trim().length > 0 &&
    parsedAmount > 0 &&
    selectedCategory.length > 0 &&
    !updateMutation.isPending;

  const handleSave = async () => {
    if (!canSave) {
      showToast({
        type: 'error',
        title: 'Missing details',
        message: 'Enter a title, amount, and category before saving.',
      });
      return;
    }

    await updateMutation.mutateAsync();
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(new Date(`${day.dateString}T12:00:00.000Z`));
    setDatePickerVisible(false);
  };

  return {
    amount,
    canSave,
    category,
    customCategory,
    dateLabel: formatDateTime(selectedDate),
    datePickerVisible,
    handleDayPress,
    handleSave,
    loadingExpense,
    navigation,
    saving: updateMutation.isPending,
    selectedDateKey: formatDateKey(selectedDate),
    setAmount,
    setCategory,
    setCustomCategory,
    setDatePickerVisible,
    setTitle,
    title,
  };
}
