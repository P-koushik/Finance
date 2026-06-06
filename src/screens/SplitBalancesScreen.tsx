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
import { RouteProp, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { RootStackParamList, SettlementSuggestion } from '../types';
import { formatMoneyString } from '../utils/format';

type Route = RouteProp<RootStackParamList, 'SplitBalances'>;

const shortId = (value: string) =>
  value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : value;

export function SplitBalancesScreen() {
  const route = useRoute<Route>();
  const queryClient = useQueryClient();
  const { splitGroupId } = route.params;

  const balancesQuery = useQuery({
    queryKey: financeQueryKeys.splitBalances(splitGroupId),
    queryFn: () => financeApi.getSplitBalances(splitGroupId),
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

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f4f8fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />
      <Text className="px-5 py-4 text-[24px] font-black text-[#123f70]">
        Balances
      </Text>

      {balancesQuery.isLoading ||
      suggestionsQuery.isLoading ||
      paymentsQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#124777" />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-5 px-5 pb-28"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-2">
            <Text className="text-[14px] font-black text-[#68717d]">
              Net Balance
            </Text>
            {balancesQuery.data?.map(balance => {
              const amountValue = Number(balance.net_amount);
              return (
                <View
                  className="flex-row items-center justify-between rounded-[8px] bg-white p-4"
                  key={balance.user}
                >
                  <Text
                    className="max-w-[190px] text-[13px] font-bold text-[#38414d]"
                    numberOfLines={1}
                  >
                    {shortId(balance.user)}
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
            <Text className="text-[14px] font-black text-[#68717d]">
              Settlement Suggestions
            </Text>
            {suggestionsQuery.data?.map(suggestion => (
              <Pressable
                accessibilityRole="button"
                className="rounded-[8px] bg-white p-4 active:opacity-80"
                key={`${suggestion.paid_by}-${suggestion.paid_to}`}
                onPress={() => createPayment.mutate(suggestion)}
              >
                <Text className="text-[13px] font-bold text-[#38414d]">
                  {shortId(suggestion.paid_by)} pays{' '}
                  {shortId(suggestion.paid_to)}
                </Text>
                <Text className="mt-1 text-[16px] font-black text-[#9f6a05]">
                  {formatMoneyString(suggestion.amount)}
                </Text>
              </Pressable>
            ))}

            {!suggestionsQuery.data?.length ? (
              <View className="items-center rounded-[8px] bg-white p-8">
                <Text className="text-[16px] font-extrabold text-[#343b45]">
                  Settled up
                </Text>
              </View>
            ) : null}
          </View>

          <View className="gap-2">
            <Text className="text-[14px] font-black text-[#68717d]">
              Pending Payments
            </Text>
            {pendingPayments.map(payment => (
              <View className="rounded-[8px] bg-white p-4" key={payment.id}>
                <Text className="text-[13px] font-bold text-[#38414d]">
                  {shortId(payment.paid_by)} paid {shortId(payment.paid_to)}
                </Text>
                <Text className="mt-1 text-[16px] font-black text-[#2e62dd]">
                  {formatMoneyString(payment.amount)}
                </Text>
                <View className="mt-3 flex-row gap-2">
                  <Pressable
                    accessibilityRole="button"
                    className="flex-1 items-center rounded-[8px] bg-[#078f84] px-3 py-3 active:opacity-80"
                    onPress={() => confirmPayment.mutate(payment.id)}
                  >
                    <Text className="text-[13px] font-extrabold text-white">
                      Confirm
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    className="flex-1 items-center rounded-[8px] bg-[#e8edf2] px-3 py-3 active:opacity-80"
                    onPress={() => rejectPayment.mutate(payment.id)}
                  >
                    <Text className="text-[13px] font-extrabold text-[#39424e]">
                      Reject
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {!pendingPayments.length ? (
              <View className="items-center rounded-[8px] bg-white p-8">
                <Text className="text-[16px] font-extrabold text-[#343b45]">
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
