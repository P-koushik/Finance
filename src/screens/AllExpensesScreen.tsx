import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ChevronLeft, WalletCards } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmCard } from '../components/ConfirmCard';
import { ExpenseCard } from '../components/ExpenseCard';
import { useToast } from '../components/ToastProvider';
import type { Expense } from '../types';
import { deleteExpense, getExpenses } from '../utils/storage';

export function AllExpensesScreen() {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    try {
      const storedExpenses = await getExpenses();
      setExpenses(storedExpenses);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses]),
  );

  const handleDelete = (expenseId: string) => {
    setExpenseToDelete(expenseId);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) {
      return;
    }

    const nextExpenses = await deleteExpense(expenseToDelete);
    setExpenses(nextExpenses);
    setExpenseToDelete(null);
    showToast({
      type: 'success',
      title: 'Expense deleted',
      message: 'The transaction was removed from your tracker.',
    });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f4f8fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />
      <View className="flex-1 bg-[#f4f8fb]">
        <View className="h-16 flex-row items-center gap-2 bg-white px-[14px]">
          <Pressable
            accessibilityLabel="Back to home"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center"
            hitSlop={10}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#475569" size={26} strokeWidth={2.6} />
          </Pressable>
          <View className="flex-row items-center gap-2.5">
            <WalletCards color="#2e62dd" size={24} strokeWidth={2.7} />
            <Text className="text-[20px] font-extrabold text-[#2b5fd7]">
              All Transactions
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerClassName="p-[22px] pb-10"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#124777" />
            </View>
          ) : expenses.length ? (
            <View className="gap-[14px]">
              {expenses.map(expense => (
                <ExpenseCard
                  expense={expense}
                  key={expense.id}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          ) : (
            <View className="items-center rounded-[22px] bg-white p-7">
              <Text className="mb-2 text-[17px] font-extrabold text-[#343b45]">
                No transactions
              </Text>
              <Text className="text-center text-[14px] leading-[21px] text-[#7a828d]">
                Saved expenses will appear here.
              </Text>
            </View>
          )}
        </ScrollView>
        <ConfirmCard
          confirmLabel="Delete"
          message="Remove this expense from your tracker?"
          onCancel={() => setExpenseToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete expense"
          visible={Boolean(expenseToDelete)}
        />
      </View>
    </SafeAreaView>
  );
}
