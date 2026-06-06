import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StatusBar, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ReceiptText, Tag, UserRound, Wallet } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { RootStackParamList } from '../types';
import { formatMoneyString } from '../utils/format';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CreateSplitExpense'>;

const parseAmount = (value: string) => Number(value.replace(/,/g, ''));
const shortId = (value: string) =>
  value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : value;

export function CreateSplitExpenseScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const queryClient = useQueryClient();
  const { splitGroupId } = route.params;
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [notes, setNotes] = useState('');

  const splitGroupQuery = useQuery({
    queryKey: financeQueryKeys.splitGroup(splitGroupId),
    queryFn: () => financeApi.getSplitGroup(splitGroupId),
  });
  const activeMembers =
    splitGroupQuery.data?.members
      .filter(member => member.status === 'active')
      .map(member => member.user) ?? [];
  const paid_by = activeMembers[0] ?? '';
  const parsedAmount = parseAmount(amount);
  const equalShare = useMemo(
    () =>
      activeMembers.length && parsedAmount > 0
        ? parsedAmount / activeMembers.length
        : 0,
    [activeMembers.length, parsedAmount],
  );
  const canSave =
    Boolean(title.trim()) &&
    Boolean(category.trim()) &&
    parsedAmount > 0 &&
    activeMembers.length > 1 &&
    Boolean(paid_by);

  const createExpense = useMutation({
    mutationFn: () =>
      financeApi.createSplitExpense(splitGroupId, {
        title: title.trim(),
        total_amount: amount.trim(),
        paid_by,
        date: new Date().toISOString(),
        category: category.trim(),
        notes: notes.trim(),
        split_type: 'equal',
        participants: activeMembers,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.splitExpenses(splitGroupId),
        }),
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.splitBalances(splitGroupId),
        }),
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.settlementSuggestions(splitGroupId),
        }),
      ]);
      navigation.goBack();
    },
    onError: () => Alert.alert('Split expense', 'Could not create expense.'),
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f4f8fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />
      <ScrollView
        contentContainerClassName="gap-5 px-5 pb-10 py-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InputField
          icon={ReceiptText}
          label="Title"
          onChangeText={setTitle}
          placeholder="Dinner"
          value={title}
        />
        <InputField
          icon={Wallet}
          keyboardType="decimal-pad"
          label="Total Bill"
          onChangeText={setAmount}
          placeholder="3000.00"
          prefix="₹"
          value={amount}
        />
        <InputField
          icon={Tag}
          label="Category"
          onChangeText={setCategory}
          placeholder="Food"
          value={category}
        />
        <InputField
          icon={ReceiptText}
          label="Notes"
          onChangeText={setNotes}
          placeholder="Optional"
          value={notes}
        />

        <View className="gap-3 rounded-[8px] bg-white p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-black text-[#263241]">
                Split Equally
              </Text>
              <Text className="mt-1 text-[12px] font-semibold text-[#68717d]">
                {activeMembers.length} participants
              </Text>
            </View>
            <Text className="text-[15px] font-black text-[#078f84]">
              {formatMoneyString(equalShare)}
            </Text>
          </View>

          {activeMembers.map(member => (
            <View
              className="flex-row items-center justify-between rounded-[8px] bg-[#f6f8fa] px-3 py-3"
              key={member}
            >
              <View className="flex-row items-center gap-2">
                <UserRound color="#68717d" size={16} strokeWidth={2.4} />
                <Text className="text-[12px] font-bold text-[#38414d]">
                  {shortId(member)}
                </Text>
              </View>
              <Text className="text-[12px] font-black text-[#38414d]">
                {formatMoneyString(equalShare)}
              </Text>
            </View>
          ))}
        </View>

        <PrimaryButton
          disabled={!canSave}
          label="Confirm Split"
          loading={createExpense.isPending || splitGroupQuery.isLoading}
          onPress={() => createExpense.mutate()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
