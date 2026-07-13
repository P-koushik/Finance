import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowLeft,
  Car,
  ReceiptText,
  Search,
  ShoppingBag,
  Utensils,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmCard } from '../components/ConfirmCard';
import type { Expense } from '../types';
import {
  formatCurrency,
  formatExpenseTime,
  formatTransactionGroupTitle,
  getTimestamp,
} from '../utils/format';
import { useAllExpensesViewModel } from '../view-models/useAllExpensesViewModel';

const categoryUi = {
  Food: {
    Icon: Utensils,
    iconClassName: 'bg-[#EAF2EA]',
    iconColor: '#2E5D4B',
    tagClassName: 'bg-[#EAF2EA]',
    tagTextClassName: 'text-[#2E5D4B]',
  },
  Travel: {
    Icon: Car,
    iconClassName: 'bg-[#E5F0E8]',
    iconColor: '#378260',
    tagClassName: 'bg-[#E5F0E8]',
    tagTextClassName: 'text-[#378260]',
  },
  Utilities: {
    Icon: ReceiptText,
    iconClassName: 'bg-[#F4F1DE]',
    iconColor: '#8A6F25',
    tagClassName: 'bg-[#F4F1DE]',
    tagTextClassName: 'text-[#8A6F25]',
  },
  Other: {
    Icon: ShoppingBag,
    iconClassName: 'bg-[#F2EAF6]',
    iconColor: '#7A5294',
    tagClassName: 'bg-[#F2EAF6]',
    tagTextClassName: 'text-[#7A5294]',
  },
};

const getCategoryUi = (category?: string) => {
  if (
    category === 'Food' ||
    category === 'Travel' ||
    category === 'Utilities'
  ) {
    return categoryUi[category];
  }

  return categoryUi.Other;
};

type ExpenseGroup = {
  title: string;
  data: Expense[];
};

export function AllExpensesScreen() {
  const {
    confirmDelete,
    expenseToDelete,
    expenses,
    handleDelete,
    loading,
    navigation,
    refresh,
    refreshing,
    setExpenseToDelete,
  } = useAllExpensesViewModel();
  const [searchQuery, setSearchQuery] = useState('');

  const groupedExpenses = useMemo<ExpenseGroup[]>(() => {
    const trimmedSearch = searchQuery.trim().toLowerCase();
    const filteredExpenses = trimmedSearch
      ? expenses.filter(expense => {
          const searchable = [
            expense.title,
            expense.category,
            formatExpenseTime(expense.date),
            String(expense.amount),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return searchable.includes(trimmedSearch);
        })
      : expenses;

    const sortedExpenses = [...filteredExpenses].sort(
      (firstExpense, secondExpense) =>
        getTimestamp(secondExpense.date) - getTimestamp(firstExpense.date),
    );

    return sortedExpenses.reduce<ExpenseGroup[]>((groups, expense) => {
      const title = formatTransactionGroupTitle(expense.date);
      const currentGroup = groups[groups.length - 1];

      if (currentGroup?.title === title) {
        currentGroup.data.push(expense);
      } else {
        groups.push({ title, data: [expense] });
      }

      return groups;
    }, []);
  }, [expenses, searchQuery]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#EEF4EE]">
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />
      <View className="flex-1 bg-[#EEF4EE]">
        <View className="px-5 pb-4 pt-3">
          <View className="flex-row items-center gap-3">
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center rounded-[13px] bg-white active:opacity-80"
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft color="#24352E" size={21} strokeWidth={2.5} />
            </Pressable>
            <Text className="text-[20px] font-black text-[#24352E]">
              All transactions
            </Text>
          </View>
          <View className="mt-5 h-[52px] flex-row items-center gap-3 rounded-[16px] bg-white px-4">
            <Search color="#8D9B93" size={21} strokeWidth={2.4} />
            <TextInput
              autoCapitalize="none"
              clearButtonMode="while-editing"
              onChangeText={setSearchQuery}
              placeholder="Search transactions..."
              placeholderTextColor="#9AA8A0"
              className="h-full flex-1 p-0 text-[15px] font-bold text-[#24352E]"
              value={searchQuery}
            />
          </View>
        </View>

        <ScrollView
          contentContainerClassName="px-5 pb-12"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              colors={['#2E5D4B']}
              onRefresh={refresh}
              refreshing={refreshing}
              tintColor="#2E5D4B"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View className="items-center py-[42px]">
              <ActivityIndicator color="#2E5D4B" />
            </View>
          ) : groupedExpenses.length ? (
            <View className="gap-5">
              {groupedExpenses.map(group => (
                <View key={group.title} className="gap-2">
                  <Text className="px-1 text-[13px] font-black uppercase text-[#6E9081]">
                    {group.title}
                  </Text>
                  <View className="rounded-[24px] bg-white px-4 py-1 shadow-sm">
                    {group.data.map((expense, expenseIndex) => {
                      const ui = getCategoryUi(expense.category);
                      const Icon = ui.Icon;
                      const isLastInGroup =
                        expenseIndex === group.data.length - 1;

                      return (
                        <Pressable
                          accessibilityLabel={`Edit ${expense.title}`}
                          accessibilityRole="button"
                          className={`min-h-[70px] flex-row items-center gap-[13px] py-[13px] active:opacity-70 ${
                            !isLastInGroup ? 'border-b border-[#F1F5F1]' : ''
                          }`}
                          key={expense._id}
                          onLongPress={() => handleDelete(expense._id)}
                          onPress={() =>
                            navigation.navigate('EditExpense', {
                              expenseId: expense._id,
                            })
                          }
                        >
                          <View
                            className={`h-11 w-11 items-center justify-center rounded-[14px] ${ui.iconClassName}`}
                          >
                            <Icon
                              color={ui.iconColor}
                              size={23}
                              strokeWidth={2.5}
                            />
                          </View>

                          <View className="min-w-0 flex-1 gap-[3px]">
                            <Text
                              className="text-[15px] font-black text-[#24352E]"
                              numberOfLines={1}
                            >
                              {expense.title}
                            </Text>
                            <Text
                              className="text-[12.5px] font-bold text-[#9AA8A0]"
                              numberOfLines={1}
                            >
                              {formatExpenseTime(expense.date)}
                            </Text>
                          </View>

                          <View className="min-w-[86px] items-end gap-[5px]">
                            <Text
                              className="text-[15px] font-black text-[#24352E]"
                              numberOfLines={1}
                            >
                              {formatCurrency(expense.amount)}
                            </Text>
                            <View
                              className={`rounded-[10px] px-[8px] py-[4px] ${ui.tagClassName}`}
                            >
                              <Text
                                className={`text-[9px] font-black ${ui.tagTextClassName}`}
                              >
                                {expense.category ?? 'Other'}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center rounded-[24px] border border-[#EDF3ED] bg-white p-7">
              <Text className="mb-2 text-[17px] font-black text-[#24352E]">
                No transactions
              </Text>
              <Text className="text-center text-[14px] font-bold leading-[21px] text-[#8D9B93]">
                {searchQuery.trim()
                  ? 'Try a different title, category, or amount.'
                  : 'Saved expenses will appear here.'}
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
