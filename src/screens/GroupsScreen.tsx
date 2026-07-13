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
import { ChevronRight, Plus, UsersRound } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueries, useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import { appTheme } from '../styles/theme';
import type { Group, RootStackParamList, SharedGroupCategory } from '../types';
import { formatMoneyString } from '../utils/format';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const accentByCategory: Record<SharedGroupCategory, string> = {
  family: '#6AAA6B',
  friends: '#568FC9',
  household: '#A261C9',
  trip: '#568FC9',
  office: '#378260',
  other: '#A261C9',
};

const activeMemberCount = (group: Group) =>
  group.members.filter(member => member.status === 'active').length;

const mono = (name: string, index: number) => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return (words[0]?.slice(0, 2).toUpperCase() || `G${index + 1}`).slice(0, 2);
};

const memberPreview = (group: Group) => {
  const count = activeMemberCount(group);

  if (!count) {
    return 'No members yet';
  }

  const preview = group.members
    .filter(member => member.status === 'active')
    .slice(0, 3)
    .map(member => member.user.name || member.user.email || 'Member');

  return `${count} members · ${['You', ...preview].slice(0, 4).join(', ')}`;
};

export function GroupsScreen() {
  const navigation = useNavigation<Navigation>();
  const groupsQuery = useQuery({
    queryKey: financeQueryKeys.groups,
    queryFn: financeApi.getGroups,
  });
  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);
  const expenseQueries = useQueries({
    queries: groups.map(group => ({
      enabled: Boolean(group.id),
      queryKey: financeQueryKeys.groupExpenses(group.id),
      queryFn: () => financeApi.getGroupExpenses(group.id),
    })),
  });
  const groupTotals = useMemo(
    () =>
      groups.reduce<Record<string, number>>((totals, group, index) => {
        totals[group.id] =
          expenseQueries[index]?.data?.reduce(
            (sum, expense) => sum + Number(expense.amount || 0),
            0,
          ) ?? 0;

        return totals;
      }, {}),
    [expenseQueries, groups],
  );
  const refreshing =
    groupsQuery.isRefetching ||
    expenseQueries.some(expenseQuery => expenseQuery.isRefetching);
  const refresh = async () => {
    await Promise.all([
      groupsQuery.refetch(),
      ...expenseQueries.map(expenseQuery => expenseQuery.refetch()),
    ]);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#EEF4EE]">
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />

      <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
        <View>
          <Text className="text-[24px] font-black text-[#24352E]">Groups</Text>
          <Text className="mt-1 text-[13.5px] font-bold text-[#8D9B93]">
            Shared spends you do not split back
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Create group"
          accessibilityRole="button"
          className="h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#2E5D4B] shadow-lg active:opacity-80"
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <Plus color="#ffffff" size={23} strokeWidth={2.6} />
        </Pressable>
      </View>

      {groupsQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appTheme.green} />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-[16px] px-5 pb-32 pt-[18px]"
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
          {groups.map((group, index) => {
            const totalSpent = groupTotals[group.id] ?? 0;
            const expenseCount = expenseQueries[index]?.data?.length ?? 0;

            return (
              <Pressable
                accessibilityRole="button"
                className="rounded-[22px] bg-white px-[18px] pb-[18px] pt-[17px] shadow-sm active:opacity-80"
                key={group.id}
                onPress={() =>
                  navigation.navigate('GroupDetails', { groupId: group.id })
                }
              >
                <View className="flex-row items-center gap-[13px]">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-[13px]"
                    style={{
                      backgroundColor:
                        accentByCategory[group.category] ??
                        accentByCategory.other,
                    }}
                  >
                    <Text className="text-[18px] font-black text-white">
                      {mono(group.name, index)}
                    </Text>
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      className="text-[15.5px] font-black text-[#24352E]"
                      numberOfLines={1}
                    >
                      {group.name}
                    </Text>
                    <Text
                      className="mt-0.5 text-[12.5px] font-bold text-[#9AA8A0]"
                      numberOfLines={1}
                    >
                      {memberPreview(group)}
                    </Text>
                  </View>
                  <ChevronRight color="#B8D0B9" size={20} strokeWidth={2.5} />
                </View>

                <View className="mt-[15px] flex-row justify-between border-t border-dashed border-[#E7EFE7] pt-[14px]">
                  <View>
                    <Text className="text-[11px] font-extrabold text-[#9AA8A0]">
                      Total spent
                    </Text>
                    <Text className="mt-0.5 text-[15.5px] font-black text-[#24352E]">
                      {formatMoneyString(totalSpent)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[11px] font-extrabold text-[#9AA8A0]">
                      Expenses
                    </Text>
                    <Text className="mt-0.5 text-[15.5px] font-black text-[#2E5D4B]">
                      {expenseCount}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}

          {!groups.length ? (
            <View className="items-center rounded-[24px] border border-[#EDF3ED] bg-white p-8">
              <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-[#EAF2EA]">
                <UsersRound color="#2E5D4B" size={28} strokeWidth={2.5} />
              </View>
              <Text className="mt-4 text-[16px] font-black text-[#24352E]">
                No groups yet
              </Text>
              <Text className="mt-2 text-center text-[13px] font-bold text-[#8D9B93]">
                Create a family, roommate, or trip group to track shared costs.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
