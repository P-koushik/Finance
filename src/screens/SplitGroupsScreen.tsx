import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { CirclePlus, Scale } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { RootStackParamList, SplitGroup } from '../types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const activeMemberCount = (splitGroup: SplitGroup) =>
  splitGroup.members.filter(member => member.status === 'active').length;

export function SplitGroupsScreen() {
  const navigation = useNavigation<Navigation>();
  const splitGroupsQuery = useQuery({
    queryKey: financeQueryKeys.splitGroups,
    queryFn: financeApi.getSplitGroups,
  });
  const splitGroups = useMemo(
    () => splitGroupsQuery.data ?? [],
    [splitGroupsQuery.data],
  );
  const totalMembers = useMemo(
    () =>
      splitGroups.reduce(
        (total, splitGroup) => total + activeMemberCount(splitGroup),
        0,
      ),
    [splitGroups],
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f4f8fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />

      <View className="flex-row items-center justify-between px-5 pb-3 pt-4">
        <View>
          <Text className="text-[30px] font-black text-[#123f70]">Splits</Text>
          <Text className="mt-1 text-[14px] font-semibold text-[#68717d]">
            Track money to settle.
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Create split group"
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full bg-[#124777] active:opacity-80"
          onPress={() => navigation.navigate('CreateSplitGroup')}
        >
          <CirclePlus color="#ffffff" size={24} strokeWidth={2.5} />
        </Pressable>
      </View>

      <View className="flex-row gap-3 px-5 pb-5">
        <View className="flex-1 rounded-[8px] bg-white p-4 shadow-sm shadow-[color:#d5dae1]">
          <Text className="text-[12px] font-bold text-[#68717d]">
            Split Groups
          </Text>
          <Text className="mt-2 text-[22px] font-black text-[#123f70]">
            {splitGroups.length}
          </Text>
        </View>
        <View className="flex-1 rounded-[8px] bg-white p-4 shadow-sm shadow-[color:#d5dae1]">
          <Text className="text-[12px] font-bold text-[#68717d]">
            Participants
          </Text>
          <Text className="mt-2 text-[22px] font-black text-[#123f70]">
            {totalMembers}
          </Text>
        </View>
      </View>

      {splitGroupsQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#124777" />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-3 px-5 pb-28"
          showsVerticalScrollIndicator={false}
        >
          {splitGroups.map(splitGroup => (
            <Pressable
              accessibilityRole="button"
              className="rounded-[8px] bg-white p-5 shadow-sm shadow-[color:#d5dae1] active:opacity-80"
              key={splitGroup.id}
              onPress={() =>
                navigation.navigate('SplitGroupDetails', {
                  splitGroupId: splitGroup.id,
                })
              }
            >
              <View className="flex-row items-start justify-between gap-4">
                <View className="min-w-0 flex-1">
                  <Text
                    className="text-[22px] font-black text-[#263241]"
                    numberOfLines={1}
                  >
                    {splitGroup.name}
                  </Text>
                  <Text className="mt-1 text-[12px] font-semibold text-[#68717d]">
                    {activeMemberCount(splitGroup)} members active
                  </Text>
                </View>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#fff2d7]">
                  <Scale color="#9f6a05" size={23} strokeWidth={2.5} />
                </View>
              </View>

              <View className="mt-4 rounded-[8px] bg-[#eef1f4] px-4 py-3">
                <Text className="text-[13px] font-bold text-[#59626e]">
                  {splitGroup.description || 'No description added'}
                </Text>
              </View>
            </Pressable>
          ))}

          {!splitGroups.length ? (
            <View className="items-center rounded-[8px] bg-white p-8">
              <Text className="text-[16px] font-extrabold text-[#343b45]">
                No split groups yet
              </Text>
              <Text className="mt-2 text-center text-[13px] font-semibold text-[#7d8792]">
                Create a split when you expect friends to pay each other back.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
