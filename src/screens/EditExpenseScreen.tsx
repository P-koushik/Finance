import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
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
  ArrowLeft,
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
import type { ExpenseCategory, RootStackParamList } from '../types';
import { useEditExpenseViewModel } from '../view-models/useEditExpenseViewModel';

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

export function EditExpenseScreen(props: EditExpenseScreenProps) {
  const {
    amount,
    canSave,
    category,
    customCategory,
    dateLabel,
    datePickerVisible,
    handleDayPress,
    handleSave,
    loadingExpense,
    navigation,
    saving,
    selectedDateKey,
    setAmount,
    setCategory,
    setCustomCategory,
    setDatePickerVisible,
    setTitle,
    title,
  } = useEditExpenseViewModel(props);

  const parsedAmount = Number(amount.replace(/,/g, '')) || 0;
  const stepAmount = (delta: number) => {
    const next = Math.max(0, parsedAmount + delta);
    setAmount(String(next));
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#EEF4EE]">
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        className="flex-1"
      >
        <View className="flex-row items-center gap-3 px-5 pb-3 pt-3">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-[13px] bg-white active:opacity-80"
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#24352E" size={21} strokeWidth={2.5} />
          </Pressable>
          <Text className="text-[20px] font-black text-[#24352E]">
            Edit expense
          </Text>
        </View>

        <ScrollView
          contentContainerClassName="flex-grow px-5 pb-12 pt-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {loadingExpense ? (
            <View className="items-center py-16">
              <ActivityIndicator color="#2E5D4B" />
            </View>
          ) : (
            <>
              <View className="mb-[30px] items-center">
                <Text className="mb-2 text-[13px] font-black text-[#8D9B93]">
                  Amount
                </Text>
                <View className="flex-row items-center justify-center gap-3">
                  <Text className="text-[45px] font-black text-[#24352E]">
                    ₹
                  </Text>

                  <TextInput
                    className="min-w-[98px] p-0 text-center text-[48px] font-black text-[#24352E]"
                    keyboardType="decimal-pad"
                    onChangeText={setAmount}
                    placeholder="0"
                    placeholderTextColor="#24352E"
                    returnKeyType="done"
                    value={amount}
                  />

                  <View className="gap-1">
                    <Pressable
                      accessibilityLabel="Increase amount"
                      accessibilityRole="button"
                      className="h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-white active:opacity-70"
                      onPress={() => stepAmount(1)}
                    >
                      <ChevronUp color="#2E5D4B" size={16} strokeWidth={2.4} />
                    </Pressable>
                    <Pressable
                      accessibilityLabel="Decrease amount"
                      accessibilityRole="button"
                      className="h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-white active:opacity-70"
                      onPress={() => stepAmount(-1)}
                    >
                      <ChevronDown
                        color="#2E5D4B"
                        size={16}
                        strokeWidth={2.4}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              <View className="flex-1 gap-5">
                <View className="rounded-[24px] bg-white px-5 py-6 shadow-sm">
                  <InputField
                    icon={ShoppingBag}
                    label="What for?"
                    onChangeText={setTitle}
                    placeholder="e.g. Groceries"
                    returnKeyType="next"
                    value={title}
                  />
                </View>

                <View className="gap-2.5">
                  <Text className="text-[13px] font-black text-[#6E9081]">
                    Category
                  </Text>
                  <View className="flex-row flex-wrap gap-2.5">
                    {categoryOptions.map(({ label, Icon }) => {
                      const selected = category === label;
                      return (
                        <Pressable
                          accessibilityRole="button"
                          className={`min-h-[42px] flex-row items-center gap-1.5 rounded-[13px] border px-[14px] ${
                            selected
                              ? 'border-[#2E5D4B] bg-[#2E5D4B]'
                              : 'border-[#E2ECE3] bg-white'
                          }`}
                          key={label}
                          onPress={() => setCategory(label as ExpenseCategory)}
                        >
                          <Icon
                            color={selected ? '#FFFFFF' : '#6E9081'}
                            size={16}
                            strokeWidth={2.4}
                          />
                          <Text
                            className={`text-[13px] font-black ${
                              selected ? 'text-white' : 'text-[#2E5D4B]'
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
                  <View className="rounded-[24px] bg-white px-5 py-6 shadow-sm">
                    <InputField
                      icon={CircleEllipsis}
                      label="Category name"
                      onChangeText={setCustomCategory}
                      placeholder="e.g. Medical, Gifts, Education"
                      returnKeyType="next"
                      value={customCategory}
                    />
                  </View>
                ) : null}

                <View className="gap-2">
                  <Text className="text-[13px] font-black text-[#6E9081]">
                    Date
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    className="h-[52px] flex-row items-center gap-3 rounded-[16px] bg-white px-4 active:opacity-70"
                    onPress={() => setDatePickerVisible(true)}
                  >
                    <CalendarDays color="#2E5D4B" size={21} strokeWidth={2.4} />
                    <Text className="flex-1 text-[15px] font-bold text-[#24352E]">
                      {dateLabel}
                    </Text>
                    <View className="h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-[#EAF2EA]">
                      <CalendarDays
                        color="#2E5D4B"
                        size={14}
                        strokeWidth={2.2}
                      />
                    </View>
                  </Pressable>
                </View>

                <PrimaryButton
                  className="mt-2 rounded-[16px] bg-[#2E5D4B]"
                  disabled={!canSave}
                  label="Update expense"
                  loading={saving}
                  onPress={handleSave}
                />
              </View>
            </>
          )}
        </ScrollView>

        <Modal
          animationType="fade"
          transparent
          visible={datePickerVisible}
          onRequestClose={() => setDatePickerVisible(false)}
        >
          <View className="flex-1 items-center justify-center bg-[#1D2A24]/50">
            <View className="mx-6 gap-4 rounded-[26px] border border-[#E3ECE4] bg-white p-[22px]">
              <Text className="text-[18px] font-black text-[#24352E]">
                Select Date
              </Text>
              <Calendar
                current={selectedDateKey}
                markedDates={{
                  [selectedDateKey]: {
                    selected: true,
                    selectedColor: '#2E5D4B',
                    selectedTextColor: '#ffffff',
                  },
                }}
                onDayPress={handleDayPress}
                theme={{
                  arrowColor: '#2E5D4B',
                  monthTextColor: '#24352E',
                  selectedDayBackgroundColor: '#2E5D4B',
                  textDayFontWeight: '600',
                  textMonthFontWeight: '900',
                  textSectionTitleColor: '#6E9081',
                  todayTextColor: '#2E5D4B',
                }}
              />
              <PrimaryButton
                className="h-[50px] rounded-[16px] bg-[#2E5D4B]"
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
