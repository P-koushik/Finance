import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';

import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import { TrendingUp, WalletCards } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '../components/BottomBar';
import { ConfirmCard } from '../components/ConfirmCard';
import { ExpenseCard } from '../components/ExpenseCard';
import { useToast } from '../components/ToastProvider';

import type { Expense, RootStackParamList, UserProfile } from '../types';

import { formatCurrency } from '../utils/format';

import {
  defaultProfile,
  deleteExpense,
  getExpenses,
  getProfile,
} from '../utils/storage';

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { showToast } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

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

  const monthlyBudget = profile.monthlyBudget;
  const remaining = Math.max(monthlyBudget - totalSpent, 0);

  const visibleExpenses = expenses.slice(0, 10);

  const loadExpenses = useCallback(async () => {
    try {
      const [storedExpenses, storedProfile] = await Promise.all([
        getExpenses(),
        getProfile(),
      ]);

      setExpenses(storedExpenses);
      setProfile(storedProfile);
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
    if (!expenseToDelete) return;

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
        <View className="flex-row items-center justify-between bg-white px-6 h-16">
          <View className="flex-row items-center gap-2.5">
            <WalletCards color="#2e62dd" size={24} strokeWidth={2.7} />

            <Text className="text-[20px] font-extrabold text-[#2b5fd7]">
              Finance
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerClassName="p-[22px] pb-28"
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-[28px] bg-[#2e5f95] p-6">
            <Text className="text-[16px] font-bold text-[#9db6d8]">
              Total Spent
            </Text>

            <Text className="mt-3.5 text-[36px] font-normal text-white">
              {formatCurrency(totalSpent)}
            </Text>

            <View className="mt-7 flex-row items-center gap-3.5 rounded-[20px] bg-white/15 p-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#69bdc1]">
                <TrendingUp color="#ffffff" size={24} strokeWidth={2.7} />
              </View>

              <View className="flex-1 gap-1">
                <Text className="text-[14px] font-bold text-[#a8bdd9]">
                  Monthly Budget
                </Text>

                <Text className="text-[14px] font-extrabold text-[#e8f0fb]">
                  {formatCurrency(monthlyBudget)}
                </Text>
              </View>

              <View className="flex-1 gap-1">
                <Text className="text-[14px] font-bold text-[#a8bdd9]">
                  Remaining
                </Text>

                <Text className="text-[14px] font-extrabold text-[#e8f0fb]">
                  {formatCurrency(remaining)}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-6 flex-row gap-[18px]">
            <View className="flex-1 rounded-3xl bg-white p-[18px]">
              <Text className="text-[14px] font-bold text-[#6c7480]">
                Top Category
              </Text>

              <Text className="mt-2 text-[16px] font-extrabold text-[#2c5c8d]">
                {topCategory}
              </Text>
            </View>

            <View className="flex-1 rounded-3xl bg-white p-[18px]">
              <Text className="text-[14px] font-bold text-[#6c7480]">
                Daily Avg
              </Text>

              <Text className="mt-2 text-[16px] font-extrabold text-[#2c5c8d]">
                {formatCurrency(expenses.length ? totalSpent / 30 : 0)}
              </Text>
            </View>
          </View>

          <View className="mt-6 mb-3.5 flex-row items-center justify-between">
            <Text className="text-[16px] font-extrabold text-[#666e78]">
              Recent Expenses
            </Text>

            {expenses.length > 10 ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => navigation.navigate('AllExpenses')}
              >
                <Text className="text-[15px] font-extrabold text-[#088b84]">
                  View All
                </Text>
              </Pressable>
            ) : null}
          </View>

          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#124777" />
            </View>
          ) : expenses.length ? (
            <View className="gap-3.5">
              {visibleExpenses.map(expense => (
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
                No expenses yet
              </Text>

              <Text className="text-center text-[14px] leading-[21px] text-[#7a828d]">
                Add your first expense to start tracking total spending.
              </Text>
            </View>
          )}
        </ScrollView>

        <BottomBar active="home" />

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
