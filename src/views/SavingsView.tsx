import React from 'react';
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
import { BadgeIndianRupee, WalletCards } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '../components/BottomBar';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { formatCurrency } from '../utils/format';
import type {
  SavingsAction,
  useSavingsViewModel,
} from '../view-models/useSavingsViewModel';

type SavingsViewProps = ReturnType<typeof useSavingsViewModel>;

const actionOptions: Array<{ key: SavingsAction; label: string }> = [
  { key: 'deposit', label: 'Add to Savings' },
  { key: 'withdraw', label: 'Withdraw from Savings' },
];

export function SavingsView({
  action,
  amount,
  availableMoney,
  canSubmit,
  handleSubmit,
  isDeposit,
  loading,
  profile,
  saving,
  setAction,
  setAmount,
}: SavingsViewProps) {
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
