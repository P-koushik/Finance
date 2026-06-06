import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { CirclePlus, Mail, ReceiptText, UserPlus } from 'lucide-react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { RootStackParamList } from '../types';
import { formatMoneyString } from '../utils/format';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GroupDetails'>;

const shortId = (value: string) =>
  value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : value;

export function GroupDetailsScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const queryClient = useQueryClient();
  const { groupId } = route.params;
  const [memberEmail, setMemberEmail] = useState('');

  const groupQuery = useQuery({
    queryKey: financeQueryKeys.group(groupId),
    queryFn: () => financeApi.getGroup(groupId),
  });
  const expensesQuery = useQuery({
    queryKey: financeQueryKeys.groupExpenses(groupId),
    queryFn: () => financeApi.getGroupExpenses(groupId),
  });

  const activeMembers =
    groupQuery.data?.members.filter(member => member.status === 'active') ?? [];
  const totalSpent = useMemo(
    () =>
      (expensesQuery.data ?? []).reduce(
        (total, expense) => total + Number(expense.amount),
        0,
      ),
    [expensesQuery.data],
  );

  const addMember = useMutation({
    mutationFn: async () => {
      const users = await financeApi.searchUsers(memberEmail.trim());
      const user = users[0];

      if (!user) {
        throw new Error('User not found');
      }

      return financeApi.addGroupMember(groupId, user.id);
    },
    onSuccess: async () => {
      setMemberEmail('');
      await queryClient.invalidateQueries({
        queryKey: financeQueryKeys.group(groupId),
      });
    },
    onError: () => Alert.alert('Member', 'Could not add member.'),
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f4f8fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />

      <View className="flex-row items-center justify-between px-5 pb-3 pt-4">
        <View className="min-w-0 flex-1">
          <Text
            className="text-[24px] font-black text-[#123f70]"
            numberOfLines={1}
          >
            {groupQuery.data?.name ?? 'Group'}
          </Text>
          <Text className="mt-1 text-[13px] font-semibold text-[#68717d]">
            {activeMembers.length} members active
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Create group expense"
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full bg-[#078f84] active:opacity-80"
          onPress={() => navigation.navigate('CreateGroupExpense', { groupId })}
        >
          <CirclePlus color="#ffffff" size={24} strokeWidth={2.5} />
        </Pressable>
      </View>

      {groupQuery.isLoading || expensesQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#124777" />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-4 px-5 pb-28"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-[8px] bg-white p-4">
              <Text className="text-[12px] font-bold text-[#68717d]">
                Total Spent
              </Text>
              <Text className="mt-2 text-[18px] font-black text-[#123f70]">
                {formatMoneyString(totalSpent)}
              </Text>
            </View>
            <View className="flex-1 rounded-[8px] bg-white p-4">
              <Text className="text-[12px] font-bold text-[#68717d]">
                Expenses
              </Text>
              <Text className="mt-2 text-[18px] font-black text-[#123f70]">
                {expensesQuery.data?.length ?? 0}
              </Text>
            </View>
          </View>

          <View className="gap-3 rounded-[8px] bg-white p-4">
            <InputField
              autoCapitalize="none"
              icon={Mail}
              keyboardType="email-address"
              label="Member email"
              onChangeText={setMemberEmail}
              placeholder="name@email.com"
              value={memberEmail}
            />
            <PrimaryButton
              className="h-[48px] rounded-[8px]"
              disabled={!memberEmail.trim()}
              label="Add Member"
              loading={addMember.isPending}
              onPress={() => addMember.mutate()}
            />
          </View>

          <View className="gap-2">
            <Text className="px-1 text-[14px] font-black text-[#68717d]">
              Members
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {activeMembers.map(member => (
                <View
                  className="flex-row items-center gap-2 rounded-full bg-white px-3 py-2"
                  key={member.user}
                >
                  <UserPlus color="#078f84" size={14} strokeWidth={2.5} />
                  <Text className="text-[12px] font-bold text-[#38414d]">
                    {shortId(member.user)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="gap-3">
            <Text className="px-1 text-[14px] font-black text-[#68717d]">
              Group Expenses
            </Text>

            {expensesQuery.data?.map(expense => (
              <View className="rounded-[8px] bg-white p-4" key={expense.id}>
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-[#e0f6f3]">
                    <ReceiptText color="#078f84" size={22} strokeWidth={2.5} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      className="text-[15px] font-extrabold text-[#2f3742]"
                      numberOfLines={1}
                    >
                      {expense.title}
                    </Text>
                    <Text className="mt-1 text-[12px] font-semibold text-[#7d8792]">
                      Paid by {shortId(expense.paid_by)}
                    </Text>
                  </View>
                  <Text className="text-[15px] font-black text-[#2e62dd]">
                    {formatMoneyString(expense.amount)}
                  </Text>
                </View>

                {expense.items.length ? (
                  <View className="mt-4 gap-2 rounded-[8px] bg-[#f6f8fa] p-3">
                    {expense.items.map((item, index) => (
                      <View
                        className="flex-row items-center justify-between gap-3"
                        key={`${expense.id}-${item.title}-${index}`}
                      >
                        <Text
                          className="min-w-0 flex-1 text-[12px] font-bold text-[#59626e]"
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text className="text-[12px] font-black text-[#38414d]">
                          {formatMoneyString(item.amount)}
                        </Text>
                      </View>
                    ))}
                    <View className="mt-1 flex-row items-center justify-between border-t border-[#e0e5eb] pt-2">
                      <Text className="text-[12px] font-black text-[#38414d]">
                        Item subtotal
                      </Text>
                      <Text className="text-[12px] font-black text-[#078f84]">
                        {formatMoneyString(expense.item_subtotal_amount)}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            ))}

            {!expensesQuery.data?.length ? (
              <View className="items-center rounded-[8px] bg-white p-8">
                <Text className="text-[16px] font-extrabold text-[#343b45]">
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
