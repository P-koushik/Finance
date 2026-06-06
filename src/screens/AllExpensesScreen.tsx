import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Car,
  CirclePlus,
  Home,
  ReceiptText,
  Search,
  ShoppingBag,
  Utensils,
  User,
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
    iconClassName: 'bg-[#62de9a]',
    iconColor: '#144f3b',
    tag: 'LEISURE',
    tagClassName: 'bg-[#84f2dc]',
    tagTextClassName: 'text-[#09645a]',
  },
  Travel: {
    Icon: Car,
    iconClassName: 'bg-[#86eee4]',
    iconColor: '#14646a',
    tag: 'ESSENTIAL',
    tagClassName: 'bg-[#78eda4]',
    tagTextClassName: 'text-[#075a36]',
  },
  Utilities: {
    Icon: ReceiptText,
    iconClassName: 'bg-[#e3e7ea]',
    iconColor: '#164e78',
    tag: 'ESSENTIAL',
    tagClassName: 'bg-[#78eda4]',
    tagTextClassName: 'text-[#075a36]',
  },
  Other: {
    Icon: ShoppingBag,
    iconClassName: 'bg-[#d5e5ff]',
    iconColor: '#173f6a',
    tag: 'LEISURE',
    tagClassName: 'bg-[#84f2dc]',
    tagTextClassName: 'text-[#09645a]',
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

  const openTab = (screen: 'Home' | 'AddExpense' | 'Profile') => {
    navigation.navigate('MainTabs', { screen });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View className="flex-1 bg-white">
        <View className="bg-white px-[22px] pt-8">
          <Text className="text-[18px] font-black tracking-[0px] text-[#123f70]">
            All Transactions
          </Text>
          <View className="mt-4 h-[36px] flex-row items-center gap-3 rounded-xl border-[1.4px] border-[#c9ced7] bg-white px-[18px] shadow">
            <Search color="#98a1ad" size={23} strokeWidth={2.4} />
            <TextInput
              autoCapitalize="none"
              clearButtonMode="while-editing"
              onChangeText={setSearchQuery}
              placeholder="Search transactions..."
              placeholderTextColor="#b7bec8"
              className="h-11 flex-1 p-0 text-[16px] font-medium text-[#334155]"
              value={searchQuery}
            />
          </View>
        </View>

        <ScrollView
          contentContainerClassName="px-[14px] pb-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View className="items-center py-[42px]">
              <ActivityIndicator color="#124777" />
            </View>
          ) : groupedExpenses.length ? (
            <View className="gap-6 rounded-xl bg-white px-5 py-[26px] shadow-lg shadow-[#d8dee6]">
              {groupedExpenses.map((group, groupIndex) => (
                <View key={group.title} className="gap-2">
                  <Text className="mb-2 text-[15px] font-extrabold uppercase text-[#8c939d]">
                    {group.title}
                  </Text>
                  {group.data.map((expense, expenseIndex) => {
                    const ui = getCategoryUi(expense.category);
                    const Icon = ui.Icon;
                    const isLastInPanel =
                      groupIndex === groupedExpenses.length - 1 &&
                      expenseIndex === group.data.length - 1;

                    return (
                      <Pressable
                        accessibilityLabel={`Edit ${expense.title}`}
                        accessibilityRole="button"
                        key={expense._id}
                        onLongPress={() => handleDelete(expense._id)}
                        onPress={() =>
                          navigation.navigate('EditExpense', {
                            expenseId: expense._id,
                          })
                        }
                        className={`min-h-[60px] flex-row items-center gap-2.5 pb-3 active:opacity-65 ${
                          !isLastInPanel ? 'border-b border-[#edf0f3]' : ''
                        }`}
                      >
                        <View
                          className={`h-11 w-11 items-center justify-center rounded-[22px] ${ui.iconClassName}`}
                        >
                          <Icon
                            color={ui.iconColor}
                            size={26}
                            strokeWidth={2.4}
                          />
                        </View>

                        <View className="min-w-0 flex-1 gap-[3px]">
                          <Text
                            numberOfLines={1}
                            className="text-[15px] font-extrabold text-[#3a3e45]"
                          >
                            {expense.title}
                          </Text>
                          <Text
                            numberOfLines={1}
                            className="text-[13px] font-semibold text-[#7b828d]"
                          >
                            {formatExpenseTime(expense.date)} {'\u2022'}{' '}
                            {expense.category ?? 'Other'}
                          </Text>
                        </View>

                        <View className="min-w-[86px] items-end gap-[5px]">
                          <Text
                            numberOfLines={1}
                            className="text-[15px] font-extrabold text-[#2e333a]"
                          >
                            -{formatCurrency(expense.amount)}
                          </Text>
                          <View
                            className={`rounded-[10px] px-[7px] py-[3px] ${ui.tagClassName}`}
                          >
                            <Text
                              className={`text-[9px] font-black ${ui.tagTextClassName}`}
                            >
                              {ui.tag}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center rounded-xl bg-white p-7 shadow-lg shadow-[#d8dee6]">
              <Text className="mb-2 text-[17px] font-extrabold text-[#343b45]">
                No transactions
              </Text>
              <Text className="text-center text-[14px] leading-[21px] text-[#7d8792]">
                {searchQuery.trim()
                  ? 'Try a different title, category, or amount.'
                  : 'Saved expenses will appear here.'}
              </Text>
            </View>
          )}
        </ScrollView>

        <View className="h-[76px] flex-row items-center justify-around bg-white px-6">
          <Pressable
            accessibilityLabel="Open home"
            accessibilityRole="button"
            onPress={() => openTab('Home')}
            className="min-w-[58px] items-center gap-1 py-2 active:opacity-65"
          >
            <Home color="#164e78" size={22} strokeWidth={2.3} />
            <Text className="text-[12px] font-bold text-[#164e78]">Home</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Add transaction"
            accessibilityRole="button"
            onPress={() => openTab('AddExpense')}
            className="min-w-[58px] items-center gap-1 py-2 active:opacity-65"
          >
            <CirclePlus color="#4c5561" size={24} strokeWidth={2.3} />
            <Text className="text-[12px] font-bold text-[#59626e]">Add</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Open profile"
            accessibilityRole="button"
            onPress={() => openTab('Profile')}
            className="min-w-[58px] items-center gap-1 py-2 active:opacity-65"
          >
            <User color="#4c5561" size={22} strokeWidth={2.3} />
            <Text className="text-[12px] font-bold text-[#59626e]">
              Profile
            </Text>
          </Pressable>
        </View>

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
