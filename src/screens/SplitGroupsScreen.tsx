import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { Plus, Scale } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueries, useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import { appTheme } from '../styles/theme';
import type { RootStackParamList, SplitGroup } from '../types';
import { formatMoneyString, getTimestamp } from '../utils/format';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const activeMemberCount = (splitGroup: SplitGroup) =>
  splitGroup.members.filter(member => member.status === 'active').length;

const accentColors = ['#F2994A', '#A261C9', '#568FC9', '#6AAA6B'];

const money = (amount: string | number) =>
  formatMoneyString(amount).replace(/\.00$/, '');

const mono = (name: string, index: number) => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return (words[0]?.slice(0, 2).toUpperCase() || `S${index + 1}`).slice(0, 2);
};

export function SplitGroupsScreen() {
  const navigation = useNavigation<Navigation>();
  const profileQuery = useQuery({
    queryKey: financeQueryKeys.profile,
    queryFn: financeApi.getProfile,
  });
  const splitGroupsQuery = useQuery({
    queryKey: financeQueryKeys.splitGroups,
    queryFn: financeApi.getSplitGroups,
  });
  const splitGroups = useMemo(
    () => splitGroupsQuery.data ?? [],
    [splitGroupsQuery.data],
  );
  const balanceQueries = useQueries({
    queries: splitGroups.map(splitGroup => ({
      enabled: Boolean(splitGroup.id),
      queryKey: financeQueryKeys.splitBalances(splitGroup.id),
      queryFn: () => financeApi.getSplitBalances(splitGroup.id),
    })),
  });
  const expenseQueries = useQueries({
    queries: splitGroups.map(splitGroup => ({
      enabled: Boolean(splitGroup.id),
      queryKey: financeQueryKeys.splitExpenses(splitGroup.id),
      queryFn: () => financeApi.getSplitExpenses(splitGroup.id),
    })),
  });
  const currentUserId = profileQuery.data?.id ?? profileQuery.data?._id ?? '';
  const splitSummaries = useMemo(
    () =>
      splitGroups.map((splitGroup, index) => {
        const currentBalance = balanceQueries[index]?.data?.find(
          balance => balance.user === currentUserId,
        );
        const netAmount = Number(currentBalance?.net_amount ?? 0);
        const latestExpense = [...(expenseQueries[index]?.data ?? [])].sort(
          (left, right) => getTimestamp(right.date) - getTimestamp(left.date),
        )[0];
        const subtitle = latestExpense
          ? `${netAmount === 0 ? 'Settled' : 'Open'} · ${
              latestExpense.paid_by === currentUserId ? 'you paid' : 'paid'
            } ${money(latestExpense.total_amount)}`
          : `${activeMemberCount(splitGroup)} people · ${
              splitGroup.description || splitGroup.category
            }`;

        return {
          latestExpense,
          netAmount,
          splitGroup,
          subtitle,
        };
      }),
    [balanceQueries, currentUserId, expenseQueries, splitGroups],
  );
  const owedTotal = splitSummaries.reduce(
    (total, summary) =>
      summary.netAmount > 0 ? total + summary.netAmount : total,
    0,
  );
  const oweTotal = splitSummaries.reduce(
    (total, summary) =>
      summary.netAmount < 0 ? total + Math.abs(summary.netAmount) : total,
    0,
  );
  const refreshing =
    profileQuery.isRefetching ||
    splitGroupsQuery.isRefetching ||
    balanceQueries.some(balanceQuery => balanceQuery.isRefetching) ||
    expenseQueries.some(expenseQuery => expenseQuery.isRefetching);
  const refresh = async () => {
    await Promise.all([
      profileQuery.refetch(),
      splitGroupsQuery.refetch(),
      ...balanceQueries.map(balanceQuery => balanceQuery.refetch()),
      ...expenseQueries.map(expenseQuery => expenseQuery.refetch()),
    ]);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#EEF4EE]">
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />

      <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
        <View>
          <Text className="text-[24px] font-black text-[#24352E]">Splits</Text>
          <Text className="mt-1 text-[13.5px] font-bold text-[#8D9B93]">
            Shared bills you will settle back
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Create split group"
          accessibilityRole="button"
          className="h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#2E5D4B] shadow-lg active:opacity-80"
          onPress={() => navigation.navigate('CreateSplitGroup')}
        >
          <Plus color="#ffffff" size={23} strokeWidth={2.6} />
        </Pressable>
      </View>

      <View className="mx-5 mb-4 mt-[18px] flex-row gap-3">
        <View className="flex-1 rounded-[18px] bg-[#E2F2EA] px-4 py-[15px]">
          <Text className="text-[12px] font-extrabold text-[#3E8E6E]">
            You are owed
          </Text>
          <Text className="mt-1 text-[22px] font-black text-[#2E8A67]">
            {money(owedTotal)}
          </Text>
        </View>
        <View className="flex-1 rounded-[18px] bg-[#F8E4DF] px-4 py-[15px]">
          <Text className="text-[12px] font-extrabold text-[#C4614E]">
            You owe
          </Text>
          <Text className="mt-1 text-[22px] font-black text-[#B84F40]">
            {money(oweTotal)}
          </Text>
        </View>
      </View>

      {splitGroupsQuery.isLoading || profileQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appTheme.green} />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-[14px] px-5 pb-32 pt-1"
          refreshControl={
            <RefreshControl
              colors={['#2E5D4B']}
              onRefresh={refresh}
              refreshing={refreshing}
              tintColor="#2E5D4B"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {splitSummaries.map(({ netAmount, splitGroup, subtitle }, index) => {
            const settled = netAmount === 0;
            const owes = netAmount < 0;

            return (
              <Pressable
                accessibilityRole="button"
                className="flex-row items-center gap-[13px] rounded-[20px] bg-white px-4 py-[15px] shadow-sm active:opacity-80"
                key={splitGroup.id}
                onPress={() =>
                  navigation.navigate('SplitGroupDetails', {
                    splitGroupId: splitGroup.id,
                  })
                }
              >
                <View
                  className="h-[46px] w-[46px] items-center justify-center rounded-[14px]"
                  style={{
                    backgroundColor: accentColors[index % accentColors.length],
                  }}
                >
                  <Text className="text-[18px] font-black text-white">
                    {mono(splitGroup.name, index)}
                  </Text>
                </View>
                <View className="min-w-0 flex-1">
                  <Text
                    className="text-[15.5px] font-black text-[#24352E]"
                    numberOfLines={1}
                  >
                    {splitGroup.name}
                  </Text>
                  <Text
                    className="mt-0.5 text-[12.5px] font-bold text-[#9AA8A0]"
                    numberOfLines={1}
                  >
                    {subtitle}
                  </Text>
                </View>
                <View className="min-w-[68px] items-end">
                  {settled ? (
                    <Text className="text-[15px] font-black text-[#9AA8A0]">
                      Settled
                    </Text>
                  ) : (
                    <>
                      <Text
                        className={`text-[15px] font-black ${
                          owes ? 'text-[#B84F40]' : 'text-[#2E8A67]'
                        }`}
                      >
                        {money(Math.abs(netAmount))}
                      </Text>
                      <Text
                        className={`text-[11px] font-black ${
                          owes ? 'text-[#B84F40]' : 'text-[#2E8A67]'
                        }`}
                      >
                        {owes ? 'you owe' : 'you get'}
                      </Text>
                    </>
                  )}
                </View>
              </Pressable>
            );
          })}

          {!splitGroups.length ? (
            <View className="items-center rounded-[24px] border border-[#EDF3ED] bg-white p-8">
              <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-[#EAF2EA]">
                <Scale color="#2E5D4B" size={28} strokeWidth={2.5} />
              </View>
              <Text className="mt-4 text-[16px] font-black text-[#24352E]">
                No split groups yet
              </Text>
              <Text className="mt-2 text-center text-[13px] font-bold text-[#8D9B93]">
                Create a split when you expect friends to pay each other back.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
