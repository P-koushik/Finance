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
import { BadgeIndianRupee } from 'lucide-react-native';

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
  { key: 'deposit', label: 'Add to Savings' },
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
      <View className="flex-1 justify-end bg-black/25">
        <Pressable className="flex-1" onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
          className="max-h-[84%] overflow-hidden rounded-t-[32px] bg-[#f4f8fb]"
        >
          <ScrollView
            contentContainerClassName="p-[18px] pt-6 pb-11"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {savings.loading ? (
              <View className="items-center py-8">
                <ActivityIndicator color="#124777" />
              </View>
            ) : (
              <>
                <View className="h-[112px] justify-end rounded-[8px] bg-[#078f84] p-4">
                  <Text className="text-[14px] font-bold text-[#bde9e4]">
                    Savings Balance
                  </Text>
                  <Text
                    className="mt-1.5 text-[30px] font-extrabold text-white"
                    numberOfLines={1}
                  >
                    {formatCurrency(savings.profile.savings)}
                  </Text>
                </View>

                <View className="mt-3 flex-row gap-2.5">
                  <View className="flex-1 rounded-[8px] bg-white p-3">
                    <Text className="text-[12px] font-bold text-[#6c7480]">
                      Available
                    </Text>
                    <Text
                      className="mt-1.5 text-[14px] font-extrabold text-[#2c5c8d]"
                      numberOfLines={1}
                    >
                      {formatCurrency(savings.availableMoney)}
                    </Text>
                  </View>

                  <View className="flex-1 rounded-[8px] bg-white p-3">
                    <Text className="text-[12px] font-bold text-[#6c7480]">
                      Monthly Amount
                    </Text>
                    <Text
                      className="mt-1.5 text-[14px] font-extrabold text-[#2c5c8d]"
                      numberOfLines={1}
                    >
                      {formatCurrency(savings.profile.monthly_income)}
                    </Text>
                  </View>
                </View>

                <View className="mt-3 rounded-[8px] bg-white p-4 shadow-md shadow-[color:#d5dae1]">
                  <Text className="text-[15px] font-extrabold text-[#2f3742]">
                    Savings Action
                  </Text>

                  <View className="mt-3 flex-row gap-2">
                    {savingsActions.map(option => {
                      const selected = savings.action === option.key;

                      return (
                        <Pressable
                          accessibilityRole="button"
                          className={`min-h-10 flex-1 items-center justify-center rounded-[8px] px-3 ${
                            selected ? 'bg-[#078f84]' : 'bg-[#eef1f4]'
                          }`}
                          key={option.key}
                          onPress={() => savings.setAction(option.key)}
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
                    className="mt-4"
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
