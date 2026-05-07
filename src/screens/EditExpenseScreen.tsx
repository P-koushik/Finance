import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BadgeDollarSign,
  CalendarDays,
  Car,
  ChevronLeft,
  CircleEllipsis,
  ShoppingBag,
  Utensils,
  WalletCards,
  Zap,
} from 'lucide-react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useToast } from '../components/ToastProvider';
import type { Expense, ExpenseCategory, RootStackParamList } from '../types';
import { getExpenses, updateExpense } from '../utils/storage';

type EditExpenseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditExpense'
>;

const categoryOptions = [
  { label: 'Food', Icon: Utensils },
  { label: 'Travel', Icon: Car },
  { label: 'Utilities', Icon: Zap },
  { label: 'Other', Icon: CircleEllipsis },
] as const;

const standardCategories: ExpenseCategory[] = ['Food', 'Travel', 'Utilities'];

const getSafeDate = (dateString: string) => {
  const date = new Date(dateString);

  return Number.isNaN(date.getTime()) ? new Date() : date;
};

export function EditExpenseScreen({
  navigation,
  route,
}: EditExpenseScreenProps) {
  const { showToast } = useToast();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadExpense = async () => {
      const expenses = await getExpenses();
      const selectedExpense = expenses.find(
        item => item.id === route.params.expenseId,
      );

      if (!mounted) {
        return;
      }

      if (!selectedExpense) {
        showToast({
          type: 'error',
          title: 'Transaction not found',
          message: 'This transaction may have already been removed.',
        });
        navigation.goBack();
        return;
      }

      const storedCategory = selectedExpense.category ?? 'Other';

      setExpense(selectedExpense);
      setTitle(selectedExpense.title);
      setAmount(String(selectedExpense.amount));
      setSelectedDate(getSafeDate(selectedExpense.createdAt));

      if (standardCategories.includes(storedCategory as ExpenseCategory)) {
        setCategory(storedCategory as ExpenseCategory);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(storedCategory === 'Other' ? '' : storedCategory);
      }
    };

    loadExpense();

    return () => {
      mounted = false;
    };
  }, [navigation, route.params.expenseId, showToast]);

  const parsedAmount = useMemo(
    () => Number(amount.replace(/,/g, '')),
    [amount],
  );
  const selectedCategory =
    category === 'Other' ? customCategory.trim() : category;
  const canSave =
    Boolean(expense) &&
    title.trim().length > 0 &&
    parsedAmount > 0 &&
    selectedCategory.length > 0 &&
    !saving;

  const dateLabel = selectedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const selectedDateKey = selectedDate.toISOString().split('T')[0];

  const handleDayPress = (day: DateData) => {
    setSelectedDate(new Date(`${day.dateString}T12:00:00.000Z`));
    setDatePickerVisible(false);
  };

  const handleSave = async () => {
    if (!expense || !canSave) {
      showToast({
        type: 'error',
        title: 'Missing details',
        message: 'Enter a title, amount, and category before saving.',
      });
      return;
    }

    setSaving(true);

    try {
      const nextExpenses = await updateExpense({
        ...expense,
        amount: parsedAmount,
        category: selectedCategory,
        createdAt: selectedDate.toISOString(),
        title: title.trim(),
      });

      if (!nextExpenses) {
        showToast({
          type: 'error',
          title: 'Transaction not found',
          message: 'This transaction may have already been removed.',
        });
        return;
      }

      showToast({
        type: 'success',
        title: 'Transaction updated',
        message: 'Your changes were saved.',
      });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f4f8fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        className="flex-1 bg-[#f4f8fb]"
      >
        <View className="h-[58px] flex-row items-center bg-white px-3">
          <Pressable
            accessibilityLabel="Back to transactions"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center"
            hitSlop={10}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#475569" size={26} strokeWidth={2.6} />
          </Pressable>

          <View className="flex-row items-center gap-2">
            <WalletCards color="#2e62dd" size={22} strokeWidth={2.7} />
            <Text className="text-[18px] font-extrabold text-[#2b5fd7]">
              Edit Transaction
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerClassName="p-[18px] pb-11"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="h-[136px] justify-end overflow-hidden rounded-lg bg-[#1f506f] p-[18px]">
            <View className="absolute inset-0 bg-[#072636]/30" />
            <View className="absolute left-6 top-6 gap-[11px] -rotate-[10deg]">
              <View className="h-[9px] w-[240px] rounded-[5px] bg-white/15" />
              <View className="h-[9px] w-[130px] rounded-[5px] bg-white/20" />
              <View className="h-[9px] w-[200px] rounded-[5px] bg-white/25" />
            </View>
            <Text className="mb-1 text-[16px] font-extrabold text-white">
              Edit Expense
            </Text>
            <Text className="w-[78%] text-[14px] font-semibold leading-[19px] text-[#c8d7e6]">
              Update the details without creating a duplicate transaction.
            </Text>
          </View>

          <View className="mt-[22px] gap-[22px] rounded-[10px] bg-white p-5 shadow-md shadow-[color:#d5dae1]">
            <InputField
              icon={ShoppingBag}
              label="Expense Title"
              onChangeText={setTitle}
              placeholder="e.g. Weekly Groceries"
              returnKeyType="next"
              value={title}
            />

            <InputField
              icon={BadgeDollarSign}
              keyboardType="decimal-pad"
              label="Amount"
              onChangeText={setAmount}
              placeholder="0.00"
              prefix="₹"
              returnKeyType="done"
              value={amount}
            />

            <View className="gap-2.5">
              <Text className="text-[14px] font-semibold text-[#686e78]">
                Quick Category
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categoryOptions.map(({ label, Icon }) => {
                  const selected = category === label;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      className={`min-h-[34px] flex-row items-center gap-1.5 rounded-[21px] px-[13px] ${
                        selected ? 'bg-[#75e5df]' : 'bg-[#e9edf0]'
                      }`}
                      key={label}
                      onPress={() => setCategory(label)}
                    >
                      <Icon
                        color={selected ? '#117b78' : '#6f7782'}
                        size={18}
                        strokeWidth={2.4}
                      />
                      <Text
                        className={`text-[14px] font-extrabold ${
                          selected ? 'text-[#117b78]' : 'text-[#606872]'
                        }`}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {category === 'Other' ? (
              <InputField
                icon={CircleEllipsis}
                label="Category Name"
                onChangeText={setCustomCategory}
                placeholder="e.g. Medical, Gifts, Education"
                returnKeyType="next"
                value={customCategory}
              />
            ) : null}

            <View className="gap-2">
              <Text className="text-[14px] font-semibold text-[#686e78]">
                Date
              </Text>
              <Pressable
                accessibilityRole="button"
                className="h-[50px] flex-row items-center gap-3 rounded-lg bg-[#eef1f4] px-4 active:opacity-70"
                onPress={() => setDatePickerVisible(true)}
              >
                <CalendarDays color="#747c88" size={22} strokeWidth={2.4} />
                <Text className="text-[15px] font-bold text-[#626a75]">
                  {dateLabel}
                </Text>
              </Pressable>
            </View>
          </View>

          <PrimaryButton
            className="mt-6"
            disabled={!canSave}
            label="Update Expense"
            loading={saving}
            onPress={handleSave}
          />
        </ScrollView>

        <Modal
          animationType="fade"
          transparent
          visible={datePickerVisible}
          onRequestClose={() => setDatePickerVisible(false)}
        >
          <View className="flex-1 items-center justify-center bg-slate-900/40">
            <View className="mx-6 gap-4 rounded-[18px] bg-white p-5">
              <Text className="text-[18px] font-extrabold text-[#2f3742]">
                Select Date
              </Text>
              <Calendar
                current={selectedDateKey}
                markedDates={{
                  [selectedDateKey]: {
                    selected: true,
                    selectedColor: '#078f84',
                    selectedTextColor: '#ffffff',
                  },
                }}
                onDayPress={handleDayPress}
                theme={{
                  arrowColor: '#124777',
                  monthTextColor: '#2f3742',
                  selectedDayBackgroundColor: '#078f84',
                  textDayFontWeight: '600',
                  textMonthFontWeight: '900',
                  textSectionTitleColor: '#6f7782',
                  todayTextColor: '#2e62dd',
                }}
              />
              <PrimaryButton
                className="h-[50px]"
                label="Close Calendar"
                onPress={() => setDatePickerVisible(false)}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
