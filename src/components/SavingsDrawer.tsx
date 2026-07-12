import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { BadgeIndianRupee, PiggyBank, X } from 'lucide-react-native';

import { formatCurrency } from '../utils/format';
import {
  SavingsAction,
  useSavingsViewModel,
} from '../view-models/useSavingsViewModel';
import { InputField } from './InputField';
import { PrimaryButton } from './PrimaryButton';

type SavingsDrawerProps = {
  onClose: () => void;
  open: boolean;
  savings: ReturnType<typeof useSavingsViewModel>;
};

const savingsActions: Array<{ key: SavingsAction; label: string }> = [
  { key: 'deposit', label: 'Transfer in' },
  { key: 'withdraw', label: 'Withdraw' },
];

export function SavingsDrawer({ onClose, open, savings }: SavingsDrawerProps) {
  const handleSubmit = async () => {
    const saved = await savings.handleSubmit();

    if (saved) {
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={open}
    >
      <View className="flex-1 justify-end bg-[#1D2A24]/40">
        <Pressable className="flex-1" onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
          className="max-h-[84%] overflow-hidden rounded-t-[32px] bg-white"
        >
          <ScrollView
            contentContainerClassName="px-[22px] pb-8 pt-2"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {savings.loading ? (
              <View className="items-center py-8">
                <ActivityIndicator color="#2E5D4B" />
              </View>
            ) : (
              <>
                <View className="mx-auto mb-4 h-[5px] w-[42px] rounded-full bg-[#DCE6DC]" />

                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-[20px] font-black text-[#24352E]">
                    Move money
                  </Text>
                  <Pressable
                    accessibilityLabel="Close savings drawer"
                    accessibilityRole="button"
                    className="h-[34px] w-[34px] items-center justify-center rounded-[12px] bg-[#F1F6F1]"
                    onPress={onClose}
                  >
                    <X color="#6E9081" size={20} strokeWidth={2.5} />
                  </Pressable>
                </View>

                <View className="mb-[18px] flex-row items-center justify-between rounded-[18px] bg-[#EAF2EA] px-4 py-[14px]">
                  <View>
                    <Text className="text-[12px] font-extrabold text-[#6E9081]">
                      Current savings
                    </Text>
                    <Text
                      className="text-[22px] font-black text-[#2E5D4B]"
                      numberOfLines={1}
                    >
                      {formatCurrency(savings.profile.savings)}
                    </Text>
                  </View>
                  <PiggyBank color="#7FA968" size={28} strokeWidth={2.5} />
                </View>

                <View className="rounded-[22px] border border-[#EDF3ED] bg-white p-4">
                  <View className="mb-[18px] flex-row rounded-[16px] bg-[#F1F6F1] p-1">
                    {savingsActions.map(option => {
                      const selected = savings.action === option.key;

                      return (
                        <Pressable
                          accessibilityRole="button"
                          className={`flex-1 items-center justify-center rounded-[12px] px-3 py-[11px] ${
                            selected ? 'bg-white' : ''
                          }`}
                          key={option.key}
                          onPress={() => savings.setAction(option.key)}
                        >
                          <Text
                            className={`text-center text-[12px] font-extrabold ${
                              selected ? 'text-[#2E5D4B]' : 'text-[#6E9081]'
                            }`}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <View>
                    <InputField
                      icon={BadgeIndianRupee}
                      keyboardType="decimal-pad"
                      label={
                        savings.isDeposit
                          ? 'Amount to Add'
                          : 'Amount to Withdraw'
                      }
                      onChangeText={savings.setAmount}
                      placeholder="0"
                      prefix="₹"
                      returnKeyType="done"
                      value={savings.amount}
                    />
                  </View>

                  <PrimaryButton
                    className="mt-4 rounded-[18px] bg-[#2E5D4B]"
                    disabled={!savings.canSubmit}
                    label={
                      savings.isDeposit
                        ? 'Add to Savings'
                        : 'Withdraw from Savings'
                    }
                    loading={savings.saving}
                    onPress={handleSubmit}
                  />
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
