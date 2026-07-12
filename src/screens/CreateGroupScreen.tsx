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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Plus, UsersRound } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { RootStackParamList, UserSearchResult } from '../types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const avatarColors = ['#6AAA6B', '#C96552', '#D1A51E', '#378260', '#568FC9'];

const initial = (user: UserSearchResult) =>
  (user.name || user.email).trim().slice(0, 1).toUpperCase() || 'U';

export function CreateGroupScreen() {
  const navigation = useNavigation<Navigation>();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const usersQuery = useQuery({
    queryKey: ['finance', 'user-search', 'all'],
    queryFn: () => financeApi.searchUsers(''),
  });

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  const toggleMember = (userId: string) => {
    setSelectedIds(current => {
      const next = new Set(current);

      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }

      return next;
    });
  };

  const createGroup = useMutation({
    mutationFn: async () => {
      const group = await financeApi.createGroup({
        name: name.trim(),
        description: '',
        category: 'family',
        default_currency: 'INR',
      });

      await Promise.all(
        Array.from(selectedIds).map(userId =>
          financeApi.addGroupMember(group.id, userId),
        ),
      );

      return group;
    },
    onSuccess: async group => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.groups,
        }),
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.group(group.id),
        }),
      ]);
      navigation.replace('GroupDetails', { groupId: group.id });
    },
    onError: () => Alert.alert('Group', 'Could not create group.'),
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#EEF4EE]">
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />
      <View className="flex-row items-center gap-3 px-5 pb-3 pt-3">
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-[13px] bg-white active:opacity-80"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#24352E" size={21} strokeWidth={2.5} />
        </Pressable>
        <Text className="text-[20px] font-black text-[#24352E]">New group</Text>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-32 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-[22px] items-center">
          <View className="h-[76px] w-[76px] items-center justify-center rounded-[24px] bg-[#EAF2EA]">
            <UsersRound color="#2E5D4B" size={34} strokeWidth={2.4} />
          </View>
        </View>

        <Text className="mb-2 text-[13px] font-black text-[#6E9081]">
          Group name
        </Text>
        <TextInput
          className="h-[52px] rounded-[16px] bg-white px-4 text-[15px] font-bold text-[#24352E]"
          onChangeText={setName}
          placeholder="e.g. Home Expenses"
          placeholderTextColor="#7B8084"
          value={name}
        />

        <Text className="mb-3 mt-6 text-[13px] font-black text-[#6E9081]">
          Add members
        </Text>
        <View className="gap-3">
          {usersQuery.isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#2E5D4B" />
            </View>
          ) : null}
          {users.map((user, index) => {
            const selected = selectedIds.has(user.id);

            return (
              <Pressable
                accessibilityRole="button"
                className={`flex-row items-center gap-3 rounded-[15px] px-[14px] py-[11px] ${
                  selected ? 'border border-[#2E5D4B] bg-white' : 'bg-white'
                }`}
                key={user.id}
                onPress={() => toggleMember(user.id)}
              >
                <View
                  className="h-10 w-10 items-center justify-center rounded-[12px]"
                  style={{
                    backgroundColor: avatarColors[index % avatarColors.length],
                  }}
                >
                  <Text className="text-[15px] font-black text-white">
                    {initial(user)}
                  </Text>
                </View>
                <Text
                  className="min-w-0 flex-1 text-[14.5px] font-black text-[#24352E]"
                  numberOfLines={1}
                >
                  {user.name || user.email}
                </Text>
                <View
                  className={`h-[26px] w-[26px] items-center justify-center rounded-[9px] ${
                    selected ? 'bg-[#2E5D4B]' : 'bg-[#F2F7F2]'
                  }`}
                >
                  {selected ? (
                    <Check color="#FFFFFF" size={15} strokeWidth={2.7} />
                  ) : (
                    <Plus color="#C7D6CD" size={16} strokeWidth={2.7} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="absolute bottom-4 left-5 right-5">
        <PrimaryButton
          className="rounded-[16px] bg-[#2E5D4B]"
          disabled={!name.trim()}
          label="Create group"
          loading={createGroup.isPending}
          onPress={() => createGroup.mutate()}
        />
      </View>
    </SafeAreaView>
  );
}
