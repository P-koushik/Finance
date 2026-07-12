import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {
  ArrowLeft,
  ReceiptText,
  Scale,
  Settings,
  UserPlus,
} from 'lucide-react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import { appTheme } from '../styles/theme';
import type { RootStackParamList } from '../types';
import { formatMoneyString } from '../utils/format';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'SplitGroupDetails'>;

const shortId = (value: string) =>
  value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : value;

export function SplitGroupDetailsScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { splitGroupId } = route.params;

  const splitGroupQuery = useQuery({
    queryKey: financeQueryKeys.splitGroup(splitGroupId),
    queryFn: () => financeApi.getSplitGroup(splitGroupId),
  });
  const expensesQuery = useQuery({
    queryKey: financeQueryKeys.splitExpenses(splitGroupId),
    queryFn: () => financeApi.getSplitExpenses(splitGroupId),
  });
  const suggestionsQuery = useQuery({
    queryKey: financeQueryKeys.settlementSuggestions(splitGroupId),
    queryFn: () => financeApi.getSettlementSuggestions(splitGroupId),
  });

  const activeMembers =
    splitGroupQuery.data?.members.filter(
      member => member.status === 'active',
    ) ?? [];
  const totalSplitAmount = useMemo(
    () =>
      (expensesQuery.data ?? []).reduce(
        (total, expense) =>
          expense.status === 'active'
            ? total + Number(expense.total_amount)
            : total,
        0,
      ),
    [expensesQuery.data],
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#EEF4EE]">
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />

      <View className="flex-row items-center gap-3 px-5 pb-[18px] pt-3">
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-[13px] bg-white active:opacity-80"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#24352E" size={21} strokeWidth={2.5} />
        </Pressable>
        <Text
          className="min-w-0 flex-1 text-[20px] font-black text-[#24352E]"
          numberOfLines={1}
        >
          {splitGroupQuery.data?.name ?? 'Split'}
        </Text>
        <Pressable
          accessibilityLabel="Split settings"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-[13px] bg-white active:opacity-80"
          onPress={() =>
            navigation.navigate('SplitGroupSettings', { splitGroupId })
          }
        >
          <Settings color="#2E5D4B" size={20} strokeWidth={2.5} />
        </Pressable>
      </View>

      {splitGroupQuery.isLoading || expensesQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appTheme.green} />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-4 px-5 pb-32"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center rounded-[26px] border border-[#EDF3ED] bg-white p-[22px]">
            <Text className="text-[13px] font-extrabold text-[#8D9B93]">
              Settlement suggestions
            </Text>
            <Text className="mt-1 text-[40px] font-black text-[#2E5D4B]">
              {suggestionsQuery.data?.length ?? 0}
            </Text>
            <Text className="mt-1 text-[13px] font-bold text-[#9AA8A0]">
              {formatMoneyString(totalSplitAmount)} total active split
            </Text>
          </View>

          <View className="flex-row gap-2.5">
            <Pressable
              accessibilityRole="button"
              className="flex-1 rounded-[16px] border border-[#E3ECE4] bg-white py-[14px] active:opacity-80"
              onPress={() =>
                navigation.navigate('CreateSplitExpense', { splitGroupId })
              }
            >
              <Text className="text-center text-[14px] font-extrabold text-[#2E5D4B]">
                Add expense
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="flex-1 rounded-[16px] bg-[#2E5D4B] py-[14px] active:opacity-80"
              onPress={() =>
                navigation.navigate('SplitBalances', { splitGroupId })
              }
            >
              <Text className="text-center text-[14px] font-extrabold text-white">
                Settle up
              </Text>
            </Pressable>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-[16px] font-black text-[#24352E]">
              Participants
            </Text>
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center gap-1 rounded-[12px] bg-white px-3 py-2 active:opacity-80"
              onPress={() =>
                navigation.navigate('AddSplitGroupMembers', { splitGroupId })
              }
            >
              <UserPlus color="#2E5D4B" size={15} strokeWidth={2.5} />
              <Text className="text-[12px] font-black text-[#2E5D4B]">
                Manage people
              </Text>
            </Pressable>
          </View>
          <View className="rounded-[24px] border border-[#EDF3ED] bg-white px-4 py-1">
            {activeMembers.map(member => (
              <View
                className="flex-row items-center gap-[13px] border-b border-[#F1F5F1] py-[14px]"
                key={member.user.id}
              >
                <View className="h-[42px] w-[42px] items-center justify-center rounded-[13px] bg-[#2E5D4B]">
                  <Text className="text-[14px] font-black text-white">
                    {(member.user.name || member.user.email || member.user.id)
                      .slice(0, 1)
                      .toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-extrabold text-[#24352E]">
                    {member.user.name ||
                      member.user.email ||
                      shortId(member.user.id)}
                  </Text>
                  <Text className="text-[12px] font-bold text-[#9AA8A0]">
                    {member.role}
                  </Text>
                </View>
                <UserPlus color="#7FA968" size={18} strokeWidth={2.5} />
              </View>
            ))}
          </View>

          <Text className="text-[16px] font-black text-[#24352E]">
            Split expenses
          </Text>
          <View className="rounded-[24px] border border-[#EDF3ED] bg-white px-4 py-1">
            {expensesQuery.data?.map(expense => (
              <View
                className="flex-row items-center gap-[13px] border-b border-[#F1F5F1] py-[13px]"
                key={expense.id}
              >
                <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#EAF2EA]">
                  <ReceiptText color="#2E5D4B" size={22} strokeWidth={2.5} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text
                    className="text-[15px] font-extrabold text-[#24352E]"
                    numberOfLines={1}
                  >
                    {expense.title}
                  </Text>
                  <Text className="text-[12.5px] font-bold capitalize text-[#9AA8A0]">
                    {expense.split_type} split
                  </Text>
                </View>
                <Text className="text-[15px] font-black text-[#24352E]">
                  {formatMoneyString(expense.total_amount)}
                </Text>
              </View>
            ))}
            {!expensesQuery.data?.length ? (
              <View className="items-center py-8">
                <Scale color="#7FA968" size={30} strokeWidth={2.5} />
                <Text className="mt-3 text-[16px] font-black text-[#24352E]">
                  No split expenses yet
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
