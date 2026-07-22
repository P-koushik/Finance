import { useMemo, useState } from 'react';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { DateData } from 'react-native-calendars';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '../components/ToastProvider';
import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { ExpenseCategory, RootTabParamList } from '../types';
import { formatDateKey, formatDateTime } from '../utils/format';

type AddExpenseScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'AddExpense'
>;

export function useAddExpenseViewModel({ navigation }: AddExpenseScreenProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const parsedAmount = useMemo(
    () => Number(amount.replace(/,/g, '')),
    [amount],
  );
  const selectedCategory =
    category === 'Other' ? customCategory.trim() : category;

  const createMutation = useMutation({
    mutationFn: financeApi.createExpense,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.expenses,
        }),
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.profile,
        }),
      ]);
      setTitle('');
      setAmount('');
      setCategory('Food');
      setCustomCategory('');
      setSelectedDate(new Date());
      navigation.navigate('Home');
    },
  });

  const canSave =
    title.trim().length > 0 &&
    parsedAmount > 0 &&
    selectedCategory.length > 0 &&
    !createMutation.isPending;

  const handleSave = async () => {
    if (!canSave) {
      showToast({
        type: 'error',
        title: 'Missing details',
        message: 'Enter a title, amount, and category before saving.',
      });
      return;
    }

    await createMutation.mutateAsync({
      title: title.trim(),
      amount: parsedAmount,
      category: selectedCategory,
      date: selectedDate.toISOString(),
    });
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
    saving: createMutation.isPending,
    selectedDateKey: formatDateKey(selectedDate),
    setAmount,
    setCategory,
    setCustomCategory,
    setDatePickerVisible,
    setTitle,
    title,
  };
}
