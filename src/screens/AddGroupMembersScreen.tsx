import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ArrowLeft, Search, UsersRound } from 'lucide-react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { RootStackParamList, UserSearchResult } from '../types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddGroupMembers'>;

const avatarColors = ['#6AAA6B', '#C96552', '#D1A51E', '#378260', '#568FC9'];

const mono = (value: string) => value.trim().slice(0, 1).toUpperCase() || 'U';

export function AddGroupMembersScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const queryClient = useQueryClient();
  const { groupId } = route.params;
  const [search, setSearch] = useState('');

  const groupQuery = useQuery({
    queryKey: financeQueryKeys.group(groupId),
    queryFn: () => financeApi.getGroup(groupId),
  });
  const searchQuery = useQuery({
    queryKey: ['finance', 'user-search', search.trim().toLowerCase()],
    queryFn: () => financeApi.searchUsers(search.trim()),
  });

  const activeMemberIds = useMemo(
    () =>
      new Set(
        groupQuery.data?.members
          .filter(member => member.status === 'active')
          .map(member => member.user) ?? [],
      ),
    [groupQuery.data?.members],
  );
  const results = searchQuery.data ?? [];

  const addMember = useMutation({
    mutationFn: (user: UserSearchResult) =>
      financeApi.addGroupMember(groupId, user.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: financeQueryKeys.group(groupId),
      });
    },
    onError: () => Alert.alert('Member', 'Could not add member.'),
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#EEF4EE]">
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />

      <View className="flex-row items-center gap-3 px-5 pb-2 pt-3">
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-[13px] bg-white active:opacity-80"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#2D463A" size={21} strokeWidth={2.5} />
        </Pressable>
        <Text className="text-[20px] font-black text-[#24352E]">
          Add members
        </Text>
      </View>
      <Text className="px-5 text-[13.5px] font-bold text-[#8D9B93]">
        to {groupQuery.data?.name ?? 'group'}
      </Text>

      <View className="mx-5 mt-5 h-[52px] flex-row items-center gap-3 rounded-[16px] bg-white px-4">
        <Search color="#8D9B93" size={20} strokeWidth={2.4} />
        <TextInput
          autoCapitalize="none"
          className="h-full flex-1 text-[15px] font-bold text-[#24352E]"
          onChangeText={setSearch}
          placeholder="Search by email"
          placeholderTextColor="#9AA8A0"
          value={search}
        />
      </View>

      <ScrollView
        contentContainerClassName="gap-3 px-5 pb-32 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {groupQuery.isLoading || searchQuery.isFetching ? (
          <View className="items-center py-8">
            <ActivityIndicator color="#2E5D4B" />
          </View>
        ) : null}

        {results.map((user, index) => {
          const added = activeMemberIds.has(user.id);

          return (
            <View
              className="flex-row items-center gap-3 rounded-[14px] bg-white px-[14px] py-[11px]"
              key={user.id}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-[13px]"
                style={{
                  backgroundColor: avatarColors[index % avatarColors.length],
                }}
              >
                <Text className="text-[15px] font-black text-white">
                  {mono(user.name || user.email)}
                </Text>
              </View>
              <View className="min-w-0 flex-1">
                <Text
                  className="text-[15px] font-black text-[#24352E]"
                  numberOfLines={1}
                >
                  {user.name || user.email}
                </Text>
                <Text
                  className="text-[11.5px] font-bold text-[#9AA8A0]"
                  numberOfLines={1}
                >
                  {user.email}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                className={`min-w-[58px] items-center rounded-[12px] px-4 py-2.5 ${
                  added ? 'bg-[#E5F0E8]' : 'bg-[#2E6B55]'
                }`}
                disabled={added || addMember.isPending}
                onPress={() => addMember.mutate(user)}
              >
                {added ? (
                  <Text className="text-[13px] font-black text-[#6E9081]">
                    Added
                  </Text>
                ) : (
                  <Text className="text-[13px] font-black text-white">Add</Text>
                )}
              </Pressable>
            </View>
          );
        })}

        {!searchQuery.isFetching && !results.length ? (
          <View className="items-center rounded-[18px] bg-white p-6">
            <UsersRound color="#B4C2BA" size={24} strokeWidth={2.5} />
            <Text className="mt-2 text-center text-[13px] font-bold text-[#8D9B93]">
              No people found.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View className="absolute bottom-4 left-5 right-5">
        <Pressable
          accessibilityRole="button"
          className="items-center rounded-[16px] bg-[#2E6B55] py-4 active:opacity-85"
          onPress={() => navigation.navigate('GroupDetails', { groupId })}
        >
          <Text className="text-[16px] font-black text-white">Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
