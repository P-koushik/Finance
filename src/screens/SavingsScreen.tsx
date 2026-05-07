import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BadgeIndianRupee, WalletCards } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '../components/BottomBar';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useToast } from '../components/ToastProvider';
import type { Expense, UserProfile } from '../types';
import { formatCurrency } from '../utils/format';
import {
  applyMonthlyCreditIfDue,
  defaultProfile,
  getExpenses,
  getProfile,
  moveAvailableToSavings,
  withdrawSavingsToAvailable,
} from '../utils/storage';

type SavingsAction = 'deposit' | 'withdraw';

const actionOptions: Array<{ key: SavingsAction; label: string }> = [
  { key: 'deposit', label: 'Add to Savings' },
  { key: 'withdraw', label: 'Withdraw from Savings' },
];

export function SavingsScreen() {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<SavingsAction>('deposit');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const totalSpent = useMemo(
    () => expenses.reduce((total, expense) => total + expense.amount, 0),
    [expenses],
  );
  const availableMoney = Math.max(profile.availableAmount - totalSpent, 0);
  const parsedAmount = useMemo(
    () => Number(amount.replace(/,/g, '')),
    [amount],
  );
  const isDeposit = action === 'deposit';
  const canSubmit = parsedAmount > 0 && !saving && !loading;

  const loadSavings = useCallback(async () => {
    try {
      const [storedExpenses, storedProfile] = await Promise.all([
        getExpenses(),
        getProfile(),
      ]);
      const creditedProfile = await applyMonthlyCreditIfDue(storedProfile);

      setExpenses(storedExpenses);
      setProfile(creditedProfile);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavings();
    }, [loadSavings]),
  );

  const handleSubmit = async () => {
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid amount',
        message: 'Enter a positive amount.',
      });
      return;
    }

    setSaving(true);

    try {
      const nextProfile = isDeposit
        ? await moveAvailableToSavings(profile, parsedAmount, totalSpent)
        : await withdrawSavingsToAvailable(profile, parsedAmount);

      if (!nextProfile) {
        showToast({
          type: 'error',
          title: isDeposit
            ? 'Not enough available money'
            : 'Not enough savings',
          message: isDeposit
            ? 'Choose an amount within your available balance.'
            : 'Choose an amount within your savings balance.',
        });
        return;
      }

      setProfile(nextProfile);
      setAmount('');
      showToast({
        type: 'success',
        title: isDeposit ? 'Savings updated' : 'Savings withdrawn',
        message: isDeposit
          ? 'Money moved from available to savings.'
          : 'Money moved from savings to available.',
      });
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
        <View className="h-[58px] flex-row items-center justify-between bg-white px-5">
          <View className="flex-row items-center gap-2">
            <WalletCards color="#2e62dd" size={22} strokeWidth={2.7} />
            <Text className="text-[18px] font-extrabold text-[#2b5fd7]">
              Savings
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerClassName="p-[18px] pb-11"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#124777" />
            </View>
          ) : (
            <>
              <View className="h-[112px] justify-end rounded-lg bg-[#078f84] p-4">
                <Text className="text-[14px] font-bold text-[#bde9e4]">
                  Savings Balance
                </Text>
                <Text
                  className="mt-1.5 text-[30px] font-extrabold text-white"
                  numberOfLines={1}
                >
                  {formatCurrency(profile.savingsAmount)}
                </Text>
              </View>

              <View className="mt-3 flex-row gap-2.5">
                <View className="flex-1 rounded-[14px] bg-white p-3">
                  <Text className="text-[12px] font-bold text-[#6c7480]">
                    Available
                  </Text>
                  <Text
                    className="mt-1.5 text-[14px] font-extrabold text-[#2c5c8d]"
                    numberOfLines={1}
                  >
                    {formatCurrency(availableMoney)}
                  </Text>
                </View>

                <View className="flex-1 rounded-[14px] bg-white p-3">
                  <Text className="text-[12px] font-bold text-[#6c7480]">
                    Monthly Amount
                  </Text>
                  <Text
                    className="mt-1.5 text-[14px] font-extrabold text-[#2c5c8d]"
                    numberOfLines={1}
                  >
                    {formatCurrency(profile.monthlyBudget)}
                  </Text>
                </View>
              </View>

              <View className="mt-3 rounded-[10px] bg-white p-4 shadow-md shadow-[color:#d5dae1]">
                <Text className="text-[15px] font-extrabold text-[#2f3742]">
                  Savings Action
                </Text>

                <View className="mt-3 flex-row gap-2">
                  {actionOptions.map(option => {
                    const selected = action === option.key;

                    return (
                      <Pressable
                        accessibilityRole="button"
                        className={`min-h-10 flex-1 items-center justify-center rounded-xl px-3 ${
                          selected ? 'bg-[#078f84]' : 'bg-[#eef1f4]'
                        }`}
                        key={option.key}
                        onPress={() => setAction(option.key)}
                      >
                        <Text
                          className={`text-center text-[12px] font-extrabold ${
                            selected ? 'text-white' : 'text-[#58616d]'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View className="mt-4">
                  <InputField
                    icon={BadgeIndianRupee}
                    keyboardType="decimal-pad"
                    label={isDeposit ? 'Amount to Add' : 'Amount to Withdraw'}
                    onChangeText={setAmount}
                    placeholder="0"
                    prefix="₹"
                    returnKeyType="done"
                    value={amount}
                  />
                </View>

                <PrimaryButton
                  className="mt-4"
                  disabled={!canSubmit}
                  label={isDeposit ? 'Add to Savings' : 'Withdraw from Savings'}
                  loading={saving}
                  onPress={handleSubmit}
                />
              </View>
            </>
          )}
        </ScrollView>

        <BottomBar active="savings" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
