import React, { useMemo, useState } from 'react';
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
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BadgeDollarSign,
  CalendarDays,
  Car,
  CircleEllipsis,
  ShoppingBag,
  Utensils,
  WalletCards,
  Zap,
} from 'lucide-react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '../components/BottomBar';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useToast } from '../components/ToastProvider';
import type { Expense, ExpenseCategory, RootStackParamList } from '../types';
import { addExpense } from '../utils/storage';

type AddExpenseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AddExpense'
>;

export function AddExpenseScreen({ navigation }: AddExpenseScreenProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const parsedAmount = useMemo(
    () => Number(amount.replace(/,/g, '')),
    [amount],
  );
  const selectedCategory =
    category === 'Other' ? customCategory.trim() : category;
  const canSave =
    title.trim().length > 0 &&
    parsedAmount > 0 &&
    selectedCategory.length > 0 &&
    !saving;

  const handleSave = async () => {
    if (!canSave) {
      showToast({
        type: 'error',
        title: 'Missing details',
        message: 'Enter a title, amount, and category before saving.',
      });
      return;
    }

    setSaving(true);

    const expense: Expense = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      amount: parsedAmount,
      category: selectedCategory,
      createdAt: selectedDate.toISOString(),
    };

    try {
      await addExpense(expense);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { label: 'Food', Icon: Utensils },
    { label: 'Travel', Icon: Car },
    { label: 'Utilities', Icon: Zap },
    { label: 'Other', Icon: CircleEllipsis },
  ];

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

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f4f8fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        className="flex-1 bg-[#f4f8fb]"
      >
        <View className="h-[58px] flex-row items-center justify-between bg-white px-5">
          <View className="flex-row items-center gap-2">
            <WalletCards color="#2e62dd" size={22} strokeWidth={2.7} />
            <Text className="text-[18px] font-extrabold text-[#2b5fd7]">
              Finance
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
              Add New Expense
            </Text>
            <Text className="w-[78%] text-[14px] font-semibold leading-[19px] text-[#c8d7e6]">
              Keep your financial clarity by logging every spend.
            </Text>
          </View>

          <View className="mt-[22px] gap-[22px] rounded-[10px] bg-white p-5 shadow-md shadow-[#d5dae1]">
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
                {categories.map(({ label, Icon }) => {
                  const selected = category === label;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={label}
                      onPress={() => setCategory(label as ExpenseCategory)}
                      className={`min-h-[34px] flex-row items-center gap-1.5 rounded-[21px] px-[13px] ${
                        selected ? 'bg-[#75e5df]' : 'bg-[#e9edf0]'
                      }`}
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
            label="Save Expense"
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

        <BottomBar active="add" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
