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
import {
  ArrowLeft,
  CirclePlus,
  Settings,
  ReceiptText,
  UserPlus,
} from 'lucide-react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

import { groupsApi as financeApi } from '../hooks/groups-api';
import { financeQueryKeys } from '../hooks/finance-query-keys';
import { appTheme } from '../styles/theme';
import type { RootStackParamList } from '../types';
import { formatMoneyString } from '../utils/format';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GroupDetails'>;

const shortId = (value: string) =>
  value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : value;

const mono = (value: string) => value.trim().slice(0, 1).toUpperCase() || 'U';

export function GroupDetailsScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { groupId } = route.params;

  const groupQuery = useQuery({
    queryKey: financeQueryKeys.group(groupId),
    queryFn: () => financeApi.getGroup(groupId),
  });
  const expensesQuery = useQuery({
    queryKey: financeQueryKeys.groupExpenses(groupId),
    queryFn: () => financeApi.getGroupExpenses(groupId),
  });

  const activeMembers = useMemo(
    () =>
      groupQuery.data?.members.filter(member => member.status === 'active') ??
      [],
    [groupQuery.data?.members],
  );
  const memberNames = useMemo(
    () =>
      new Map(
        activeMembers.map(member => [
          member.user.id,
          member.user.name || member.user.email || shortId(member.user.id),
        ]),
      ),
    [activeMembers],
  );
  const totalSpent = useMemo(
    () =>
      (expensesQuery.data ?? []).reduce(
        (total, expense) => total + Number(expense.amount),
        0,
      ),
    [expensesQuery.data],
  );
  const refreshing = groupQuery.isRefetching || expensesQuery.isRefetching;
  const refresh = async () => {
    await Promise.all([groupQuery.refetch(), expensesQuery.refetch()]);
  };

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
          {groupQuery.data?.name ?? 'Group'}
        </Text>
        <Pressable
          accessibilityLabel="Group settings"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-[13px] bg-white active:opacity-80"
          onPress={() => navigation.navigate('GroupSettings', { groupId })}
        >
          <Settings color="#2E5D4B" size={20} strokeWidth={2.5} />
        </Pressable>
      </View>

      {groupQuery.isLoading || expensesQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appTheme.green} />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-4 px-5 pb-32"
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
          <View className="rounded-[26px] bg-[#2E5D4B] p-[22px]">
            <Text className="text-[13.5px] font-extrabold text-white/90">
              Total group spend
            </Text>
            <Text
              className="mt-1 text-[34px] font-black text-white"
              numberOfLines={1}
            >
              {formatMoneyString(totalSpent)}
            </Text>
            <View className="mt-4 flex-row items-center justify-between border-t border-white/25 pt-[14px]">
              <View>
                <Text className="text-[11.5px] font-extrabold text-white/80">
                  Expenses
                </Text>
                <Text className="text-[18px] font-black text-white">
                  {expensesQuery.data?.length ?? 0}
                </Text>
              </View>
              <View className="flex-row">
                {activeMembers.slice(0, 4).map(member => (
                  <View
                    className="-ml-2 h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-white bg-[#7FA968]"
                    key={member.user.id}
                  >
                    <Text className="text-[13px] font-black text-white">
                      {mono(
                        member.user.name || member.user.email || member.user.id,
                      )}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="flex-row gap-2.5">
            <Pressable
              accessibilityRole="button"
              className="flex-1 flex-row items-center justify-center gap-2 rounded-[15px] bg-[#2E5D4B] py-[13px] active:opacity-80"
              onPress={() =>
                navigation.navigate('CreateGroupExpense', { groupId })
              }
            >
              <CirclePlus color="#ffffff" size={18} strokeWidth={2.6} />
              <Text className="text-[14px] font-extrabold text-white">
                Add expense
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="flex-1 flex-row items-center justify-center gap-2 rounded-[15px] border border-[#E3ECE4] bg-white py-[13px] active:opacity-80"
              onPress={() =>
                navigation.navigate('AddGroupMembers', { groupId })
              }
            >
              <UserPlus color="#2E5D4B" size={18} strokeWidth={2.6} />
              <Text className="text-[14px] font-extrabold text-[#2E5D4B]">
                Manage members
              </Text>
            </Pressable>
          </View>

          <Text className="text-[16px] font-black text-[#24352E]">
            Expenses
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
                  <Text className="text-[12.5px] font-bold text-[#9AA8A0]">
                    Paid by{' '}
                    {memberNames.get(expense.paid_by) ??
                      shortId(expense.paid_by)}
                  </Text>
                </View>
                <Text className="text-[15px] font-black text-[#24352E]">
                  {formatMoneyString(expense.amount)}
                </Text>
              </View>
            ))}
            {!expensesQuery.data?.length ? (
              <View className="items-center py-8">
                <Text className="text-[16px] font-black text-[#24352E]">
                  No expenses yet
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
