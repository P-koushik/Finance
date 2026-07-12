import React from 'react';
import {
  ActivityIndicator,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, X } from 'lucide-react-native';

import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { RootStackParamList, SettlementSuggestion } from '../types';
import { formatMoneyString } from '../utils/format';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'SplitBalances'>;

const shortId = (value: string) =>
  value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : value;

export function SplitBalancesScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const queryClient = useQueryClient();
  const { splitGroupId } = route.params;

  const balancesQuery = useQuery({
    queryKey: financeQueryKeys.splitBalances(splitGroupId),
    queryFn: () => financeApi.getSplitBalances(splitGroupId),
  });
  const splitGroupQuery = useQuery({
    queryKey: financeQueryKeys.splitGroup(splitGroupId),
    queryFn: () => financeApi.getSplitGroup(splitGroupId),
  });
  const suggestionsQuery = useQuery({
    queryKey: financeQueryKeys.settlementSuggestions(splitGroupId),
    queryFn: () => financeApi.getSettlementSuggestions(splitGroupId),
  });
  const paymentsQuery = useQuery({
    queryKey: financeQueryKeys.settlementPayments(splitGroupId),
    queryFn: () => financeApi.getSettlementPayments(splitGroupId),
  });

  const invalidateSettlement = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: financeQueryKeys.splitBalances(splitGroupId),
      }),
      queryClient.invalidateQueries({
        queryKey: financeQueryKeys.settlementSuggestions(splitGroupId),
      }),
      queryClient.invalidateQueries({
        queryKey: financeQueryKeys.settlementPayments(splitGroupId),
      }),
      queryClient.invalidateQueries({
        queryKey: financeQueryKeys.splitExpenses(splitGroupId),
      }),
    ]);
  };

  const createPayment = useMutation({
    mutationFn: (suggestion: SettlementSuggestion) =>
      financeApi.createSettlementPayment(splitGroupId, {
        paid_by: suggestion.paid_by,
        paid_to: suggestion.paid_to,
        amount: suggestion.amount,
        payment_date: new Date().toISOString(),
        client_request_id: `${suggestion.paid_by}-${suggestion.paid_to}-${Date.now()}`,
      }),
    onSuccess: invalidateSettlement,
    onError: () => Alert.alert('Payment', 'Could not request payment.'),
  });
  const confirmPayment = useMutation({
    mutationFn: (paymentId: string) =>
      financeApi.confirmSettlementPayment(splitGroupId, paymentId),
    onSuccess: invalidateSettlement,
    onError: () => Alert.alert('Payment', 'Could not confirm payment.'),
  });
  const rejectPayment = useMutation({
    mutationFn: (paymentId: string) =>
      financeApi.rejectSettlementPayment(splitGroupId, paymentId),
    onSuccess: invalidateSettlement,
    onError: () => Alert.alert('Payment', 'Could not reject payment.'),
  });

  const pendingPayments =
    paymentsQuery.data?.filter(payment => payment.status === 'pending') ?? [];
  const memberName = (userId: string) => {
    const user = splitGroupQuery.data?.members.find(
      member => member.user.id === userId,
    )?.user;

    return user?.name || user?.email || shortId(userId);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#EEF4EE]">
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />
      <View className="flex-row items-center gap-3 px-5 py-3">
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-[13px] bg-white active:opacity-80"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#24352E" size={21} strokeWidth={2.5} />
        </Pressable>
        <Text className="text-[20px] font-black text-[#24352E]">Balances</Text>
      </View>

      {balancesQuery.isLoading ||
      suggestionsQuery.isLoading ||
      paymentsQuery.isLoading ||
      splitGroupQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2E5D4B" />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-5 px-5 pb-28"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-2">
            <Text className="text-[16px] font-black text-[#24352E]">
              Net Balance
            </Text>
            {balancesQuery.data?.map(balance => {
              const amountValue = Number(balance.net_amount);
              return (
                <View
                  className="flex-row items-center justify-between rounded-[18px] border border-[#EDF3ED] bg-white p-4"
                  key={balance.user}
                >
                  <Text
                    className="max-w-[190px] text-[13px] font-bold text-[#24352E]"
                    numberOfLines={1}
                  >
                    {memberName(balance.user)}
                  </Text>
                  <Text
                    className={`text-[14px] font-black ${
                      amountValue < 0 ? 'text-[#be123c]' : 'text-[#078f84]'
                    }`}
                  >
                    {formatMoneyString(balance.net_amount)}
                  </Text>
                </View>
              );
            })}
          </View>

          <View className="gap-2">
            <Text className="text-[16px] font-black text-[#24352E]">
              Settlement Suggestions
            </Text>
            {suggestionsQuery.data?.map(suggestion => (
              <Pressable
                accessibilityRole="button"
                className="rounded-[18px] border border-[#EDF3ED] bg-white p-4 active:opacity-80"
                key={`${suggestion.paid_by}-${suggestion.paid_to}`}
                onPress={() => createPayment.mutate(suggestion)}
              >
                <Text className="text-[13px] font-bold text-[#24352E]">
                  {memberName(suggestion.paid_by)} pays{' '}
                  {memberName(suggestion.paid_to)}
                </Text>
                <Text className="mt-1 text-[16px] font-black text-[#2E5D4B]">
                  {formatMoneyString(suggestion.amount)}
                </Text>
              </Pressable>
            ))}

            {!suggestionsQuery.data?.length ? (
              <View className="items-center rounded-[22px] border border-[#EDF3ED] bg-white p-8">
                <Text className="text-[16px] font-black text-[#24352E]">
                  Settled up
                </Text>
              </View>
            ) : null}
          </View>

          <View className="gap-2">
            <Text className="text-[16px] font-black text-[#24352E]">
              Pending Payments
            </Text>
            {pendingPayments.map(payment => (
              <View
                className="rounded-[18px] border border-[#EDF3ED] bg-white p-4"
                key={payment.id}
              >
                <Text className="text-[13px] font-bold text-[#24352E]">
                  {memberName(payment.paid_by)} paid{' '}
                  {memberName(payment.paid_to)}
                </Text>
                <Text className="mt-1 text-[16px] font-black text-[#2E5D4B]">
                  {formatMoneyString(payment.amount)}
                </Text>
                <View className="mt-3 flex-row gap-2">
                  <Pressable
                    accessibilityRole="button"
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-[14px] bg-[#2E5D4B] px-3 py-3 active:opacity-80"
                    onPress={() => confirmPayment.mutate(payment.id)}
                  >
                    <Check color="#ffffff" size={16} strokeWidth={2.6} />
                    <Text className="text-[13px] font-extrabold text-white">
                      Confirm
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-[14px] bg-[#F8E9E5] px-3 py-3 active:opacity-80"
                    onPress={() => rejectPayment.mutate(payment.id)}
                  >
                    <X color="#C4614E" size={16} strokeWidth={2.6} />
                    <Text className="text-[13px] font-extrabold text-[#C4614E]">
                      Reject
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {!pendingPayments.length ? (
              <View className="items-center rounded-[22px] border border-[#EDF3ED] bg-white p-8">
                <Text className="text-[16px] font-black text-[#24352E]">
                  No pending payments
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
