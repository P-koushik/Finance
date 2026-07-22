import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ReceiptText,
  Tag,
  UserRound,
  Wallet,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { RootStackParamList, UserProfile } from '../types';
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
  const [paidBy, setPaidBy] = useState('');
  const [participantIds, setParticipantIds] = useState<string[]>([]);

  const splitGroupQuery = useQuery({
    queryKey: financeQueryKeys.splitGroup(splitGroupId),
    queryFn: () => financeApi.getSplitGroup(splitGroupId),
  });
  const activeMembers =
    splitGroupQuery.data?.members.filter(
      member => member.status === 'active',
    ) ?? [];
  const parsedAmount = parseAmount(amount);
  const equalShare = useMemo(
    () =>
      participantIds.length && parsedAmount > 0
        ? parsedAmount / participantIds.length
        : 0,
    [participantIds.length, parsedAmount],
  );
  const canSave =
    Boolean(title.trim()) &&
    Boolean(category.trim()) &&
    parsedAmount > 0 &&
    participantIds.length > 1 &&
    Boolean(paidBy);

  const toggleParticipant = (userId: string) => {
    setParticipantIds(current =>
      current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId],
    );
  };

  const createExpense = useMutation({
    mutationFn: () =>
      financeApi.createSplitExpense(splitGroupId, {
        title: title.trim(),
        total_amount: amount.trim(),
        paid_by: paidBy,
        date: new Date().toISOString(),
        category: category.trim(),
        notes: notes.trim(),
        split_type: 'equal',
        participants: participantIds,
      }),
    onSuccess: async () => {
      const profile = queryClient.getQueryData<UserProfile>(
        financeQueryKeys.profile,
      );
      const currentUserId = profile?.id ?? profile?._id;

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
        ...(currentUserId === paidBy
          ? [
              queryClient.invalidateQueries({
                queryKey: financeQueryKeys.profile,
              }),
            ]
          : []),
      ]);
      navigation.goBack();
    },
    onError: () => Alert.alert('Split expense', 'Could not create expense.'),
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#EEF4EE]">
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />
      <ScrollView
        contentContainerClassName="gap-5 px-5 pb-10 py-3"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-1 flex-row items-center gap-3">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-[13px] bg-white active:opacity-80"
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#24352E" size={21} strokeWidth={2.5} />
          </Pressable>
          <Text className="text-[20px] font-black text-[#24352E]">
            Add to split
          </Text>
        </View>

        <InputField
          icon={ReceiptText}
          label="What for?"
          onChangeText={setTitle}
          placeholder="Dinner"
          value={title}
        />
        <InputField
          icon={Wallet}
          keyboardType="decimal-pad"
          label="Amount you paid"
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

        <View className="gap-2 rounded-[22px] border border-[#EDF3ED] bg-white p-4">
          <Text className="text-[15px] font-black text-[#24352E]">Paid by</Text>
          {activeMembers.map(member => {
            const selected = paidBy === member.user.id;

            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className="flex-row items-center gap-3 rounded-[16px] bg-[#F6FAF6] px-3 py-3 active:opacity-80"
                key={member.user.id}
                onPress={() => setPaidBy(member.user.id)}
              >
                {selected ? (
                  <CheckCircle2 color="#2E5D4B" size={19} strokeWidth={2.5} />
                ) : (
                  <Circle color="#9AA8A0" size={19} strokeWidth={2.2} />
                )}
                <Text className="flex-1 text-[13px] font-extrabold text-[#24352E]">
                  {member.user.name ||
                    member.user.email ||
                    shortId(member.user.id)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="gap-3 rounded-[22px] border border-[#EDF3ED] bg-white p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-black text-[#24352E]">
                Split Equally
              </Text>
              <Text className="mt-1 text-[12px] font-bold text-[#8D9B93]">
                {participantIds.length} participants
              </Text>
            </View>
            <Text className="text-[15px] font-black text-[#2E5D4B]">
              {formatMoneyString(equalShare)}
            </Text>
          </View>

          {activeMembers.map(member => {
            const selected = participantIds.includes(member.user.id);

            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                className="flex-row items-center justify-between rounded-[16px] bg-[#F6FAF6] px-3 py-3"
                key={member.user.id}
                onPress={() => toggleParticipant(member.user.id)}
              >
                <View className="flex-row items-center gap-2">
                  {selected ? (
                    <CheckCircle2 color="#2E5D4B" size={17} strokeWidth={2.4} />
                  ) : (
                    <UserRound color="#6E9081" size={16} strokeWidth={2.4} />
                  )}
                  <Text className="text-[12px] font-bold text-[#24352E]">
                    {member.user.name ||
                      member.user.email ||
                      shortId(member.user.id)}
                  </Text>
                </View>
                <Text className="text-[12px] font-black text-[#24352E]">
                  {selected ? formatMoneyString(equalShare) : 'Excluded'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton
          className="rounded-[18px] bg-[#2E5D4B]"
          disabled={!canSave}
          label="Add & re-split"
          loading={createExpense.isPending || splitGroupQuery.isLoading}
          onPress={() => createExpense.mutate()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
