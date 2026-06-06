import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { CirclePlus, Home, Plane, UsersRound } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { Group, RootStackParamList, SharedGroupCategory } from '../types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const categoryIcon: Record<
  SharedGroupCategory,
  { Icon: typeof UsersRound; tint: string; background: string }
> = {
  family: { Icon: UsersRound, tint: '#143f6d', background: '#e9f0ff' },
  friends: { Icon: UsersRound, tint: '#078f84', background: '#dff8f4' },
  household: { Icon: Home, tint: '#143f6d', background: '#e9f0ff' },
  trip: { Icon: Plane, tint: '#111827', background: '#eef1f4' },
  office: { Icon: UsersRound, tint: '#9f6a05', background: '#fff2d7' },
  other: { Icon: UsersRound, tint: '#143f6d', background: '#e9f0ff' },
};

const activeMemberCount = (group: Group) =>
  group.members.filter(member => member.status === 'active').length;

export function GroupsScreen() {
  const navigation = useNavigation<Navigation>();
  const groupsQuery = useQuery({
    queryKey: financeQueryKeys.groups,
    queryFn: financeApi.getGroups,
  });
  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);
  const totalMembers = useMemo(
    () => groups.reduce((total, group) => total + activeMemberCount(group), 0),
    [groups],
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f4f8fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />

      <View className="flex-row items-center justify-between px-5 pb-3 pt-4">
        <View>
          <Text className="text-[30px] font-black text-[#123f70]">Groups</Text>
          <Text className="mt-1 text-[14px] font-semibold text-[#68717d]">
            Manage shared expenses.
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Create group"
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full bg-[#124777] active:opacity-80"
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <CirclePlus color="#ffffff" size={24} strokeWidth={2.5} />
        </Pressable>
      </View>

      <View className="flex-row gap-3 px-5 pb-5">
        <View className="flex-1 rounded-[8px] bg-white p-4 shadow-sm shadow-[color:#d5dae1]">
          <Text className="text-[12px] font-bold text-[#68717d]">
            Active Groups
          </Text>
          <Text className="mt-2 text-[22px] font-black text-[#123f70]">
            {groups.length}
          </Text>
        </View>
        <View className="flex-1 rounded-[8px] bg-white p-4 shadow-sm shadow-[color:#d5dae1]">
          <Text className="text-[12px] font-bold text-[#68717d]">Members</Text>
          <Text className="mt-2 text-[22px] font-black text-[#123f70]">
            {totalMembers}
          </Text>
        </View>
      </View>

      {groupsQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#124777" />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-3 px-5 pb-28"
          showsVerticalScrollIndicator={false}
        >
          {groups.map(group => {
            const icon = categoryIcon[group.category] ?? categoryIcon.other;
            const Icon = icon.Icon;

            return (
              <Pressable
                accessibilityRole="button"
                className="rounded-[8px] bg-white p-5 shadow-sm shadow-[color:#d5dae1] active:opacity-80"
                key={group.id}
                onPress={() =>
                  navigation.navigate('GroupDetails', { groupId: group.id })
                }
              >
                <View className="flex-row items-start justify-between gap-4">
                  <View className="min-w-0 flex-1">
                    <Text
                      className="text-[22px] font-black text-[#263241]"
                      numberOfLines={1}
                    >
                      {group.name}
                    </Text>
                    <Text className="mt-1 text-[12px] font-semibold text-[#68717d]">
                      {activeMemberCount(group)} members active
                    </Text>
                  </View>
                  <View
                    className="h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: icon.background }}
                  >
                    <Icon color={icon.tint} size={23} strokeWidth={2.5} />
                  </View>
                </View>

                <View className="mt-5 flex-row items-center justify-between">
                  <Text className="text-[14px] font-bold text-[#68717d]">
                    Category
                  </Text>
                  <Text className="text-[14px] font-black capitalize text-[#263241]">
                    {group.category}
                  </Text>
                </View>

                <View className="mt-3 rounded-[8px] bg-[#eef1f4] px-4 py-3">
                  <Text className="text-[13px] font-bold text-[#59626e]">
                    {group.description || 'No description added'}
                  </Text>
                </View>
              </Pressable>
            );
          })}

          {!groups.length ? (
            <View className="items-center rounded-[8px] bg-white p-8">
              <Text className="text-[16px] font-extrabold text-[#343b45]">
                No groups yet
              </Text>
              <Text className="mt-2 text-center text-[13px] font-semibold text-[#7d8792]">
                Create a family, roommate, or trip group to track shared costs.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
