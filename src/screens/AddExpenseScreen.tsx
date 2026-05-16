import React from 'react';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  CalendarDays,
  Car,
  ChevronDown,
  ChevronUp,
  CircleEllipsis,
  ShoppingBag,
  Utensils,
  Zap,
} from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import type { ExpenseCategory, RootTabParamList } from '../types';
import { useAddExpenseViewModel } from '../view-models/useAddExpenseViewModel';

type AddExpenseScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'AddExpense'
>;

const categories = [
  { label: 'Food', Icon: Utensils },
  { label: 'Travel', Icon: Car },
  { label: 'Utilities', Icon: Zap },
  { label: 'Other', Icon: CircleEllipsis },
] as const;

export function AddExpenseScreen(props: AddExpenseScreenProps) {
  const {
    amount,
    canSave,
    category,
    customCategory,
    dateLabel,
    datePickerVisible,
    handleDayPress,
    handleSave,
    saving,
    selectedDateKey,
    setAmount,
    setCategory,
    setCustomCategory,
    setDatePickerVisible,
    setTitle,
    title,
  } = useAddExpenseViewModel(props);

  const parsedAmount = Number(amount.replace(/,/g, '')) || 0;
  const stepAmount = (delta: number) => {
    const next = Math.max(0, parsedAmount + delta);
    setAmount(String(next));
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#eef2f6]">
      <StatusBar barStyle="dark-content" backgroundColor="#eef2f6" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-4 pb-10 pt-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero amount area ── */}
          <View className="mb-6 items-center">
            <Text className="mb-3 text-[11px] font-black tracking-[2.5px] text-[#8a95a3]">
              AMOUNT
            </Text>
            <View className="flex-row items-center gap-3">
              {/* Rupee symbol */}
              <Text className="text-[36px] font-light text-[#8a95a3]">₹</Text>

              {/* Big amount input */}
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#c5cdd6"
                returnKeyType="done"
                value={amount}
                style={{
                  fontSize: 48,
                  fontWeight: '300',
                  color: '#2d3a47',
                  minWidth: 120,
                  textAlign: 'center',
                }}
              />

              {/* Stepper buttons */}
              <View className="gap-1">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Increase amount"
                  className="h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#dce3ea] active:opacity-60"
                  onPress={() => stepAmount(1)}
                >
                  <ChevronUp color="#4a5568" size={16} strokeWidth={2.4} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Decrease amount"
                  className="h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#dce3ea] active:opacity-60"
                  onPress={() => stepAmount(-1)}
                >
                  <ChevronDown color="#4a5568" size={16} strokeWidth={2.4} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* ── Form card — flex-1 so it stretches vertically ── */}
          <View className="flex-1 rounded-[20px] bg-white px-5 py-7 shadow-sm shadow-[color:#cdd4db]">
            <View className="flex-1 gap-7">
              {/* Expense Title */}
              <InputField
                icon={ShoppingBag}
                label="Expense Title"
                onChangeText={setTitle}
                placeholder="e.g. Weekly Groceries"
                returnKeyType="next"
                value={title}
              />

              {/* Category */}
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
                        className={`min-h-[38px] flex-row items-center gap-1.5 rounded-[21px] px-[14px] ${
                          selected ? 'bg-[#75e5df]' : 'bg-[#eef1f4]'
                        }`}
                      >
                        <Icon
                          color={selected ? '#117b78' : '#6f7782'}
                          size={16}
                          strokeWidth={2.4}
                        />
                        <Text
                          className={`text-[13px] font-extrabold ${
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

              {/* Custom category */}
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

              {/* Date — styled as an InputField-height row */}
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
                  <Text className="flex-1 text-[15px] font-bold text-[#626a75]">
                    {dateLabel}
                  </Text>
                  <View className="h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#c5cdd6]">
                    <CalendarDays color="#4a5568" size={13} strokeWidth={2} />
                  </View>
                </Pressable>
              </View>
            </View>
          </View>

          {/* ── Save button ── */}
          <PrimaryButton
            className="mt-6"
            disabled={!canSave}
            label="Save Expense"
            loading={saving}
            onPress={handleSave}
          />
        </ScrollView>

        {/* ── Date picker modal ── */}
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
