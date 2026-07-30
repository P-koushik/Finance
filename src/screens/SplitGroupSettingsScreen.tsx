import React, { useEffect, useState } from 'react';
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmCard } from '../components/ConfirmCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { splitGroupsApi as financeApi } from '../hooks/split-groups-api';
import { financeQueryKeys } from '../hooks/finance-query-keys';
import type { RootStackParamList, SharedGroupCategory } from '../types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'SplitGroupSettings'>;

const categories: SharedGroupCategory[] = [
  'family',
  'friends',
  'household',
  'trip',
  'office',
  'other',
];

export function SplitGroupSettingsScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const queryClient = useQueryClient();
  const { splitGroupId } = route.params;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SharedGroupCategory>('friends');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const splitGroupQuery = useQuery({
    queryKey: financeQueryKeys.splitGroup(splitGroupId),
    queryFn: () => financeApi.getSplitGroup(splitGroupId),
  });

  useEffect(() => {
    if (!splitGroupQuery.data) {
      return;
    }

    setName(splitGroupQuery.data.name);
    setDescription(splitGroupQuery.data.description ?? '');
    setCategory(splitGroupQuery.data.category);
  }, [splitGroupQuery.data]);

  const updateSplitGroup = useMutation({
    mutationFn: () =>
      financeApi.updateSplitGroup(splitGroupId, {
        name: name.trim(),
        description: description.trim(),
        category,
        default_currency: splitGroupQuery.data?.default_currency ?? 'INR',
      }),
    onSuccess: async splitGroup => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.splitGroups,
        }),
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.splitGroup(splitGroup.id),
        }),
      ]);
      navigation.goBack();
    },
    onError: () => Alert.alert('Split settings', 'Could not update split.'),
  });

  const deleteSplitGroup = useMutation({
    mutationFn: () => financeApi.deleteSplitGroup(splitGroupId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: financeQueryKeys.splitGroups,
      });
      navigation.navigate('MainTabs', { screen: 'SplitGroups' });
    },
    onError: () => Alert.alert('Split settings', 'Could not delete split.'),
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
        <Text className="text-[20px] font-black text-[#24352E]">
          Split settings
        </Text>
      </View>

      {splitGroupQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2E5D4B" />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-5 px-5 pb-32 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-5 rounded-[24px] bg-white p-5">
            <View className="gap-2">
              <Text className="text-[13px] font-black text-[#6E9081]">
                Split name
              </Text>
              <TextInput
                className="h-[52px] rounded-[16px] bg-[#F6FAF6] px-4 text-[15px] font-bold text-[#24352E]"
                onChangeText={setName}
                placeholder="e.g. Dinner at Olive"
                placeholderTextColor="#8D9B93"
                value={name}
              />
            </View>
            <View className="gap-2">
              <Text className="text-[13px] font-black text-[#6E9081]">
                Description
              </Text>
              <TextInput
                className="min-h-[88px] rounded-[16px] bg-[#F6FAF6] px-4 py-3 text-[15px] font-bold text-[#24352E]"
                multiline
                onChangeText={setDescription}
                placeholder="Add a note"
                placeholderTextColor="#8D9B93"
                textAlignVertical="top"
                value={description}
              />
            </View>
            <View className="gap-2">
              <Text className="text-[13px] font-black text-[#6E9081]">
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map(item => {
                  const selected = item === category;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      className={`rounded-[13px] border px-3.5 py-2.5 ${
                        selected
                          ? 'border-[#2E5D4B] bg-[#2E5D4B]'
                          : 'border-[#E3ECE4] bg-white'
                      }`}
                      key={item}
                      onPress={() => setCategory(item)}
                    >
                      <Text
                        className={`text-[12px] font-black capitalize ${
                          selected ? 'text-white' : 'text-[#2E5D4B]'
                        }`}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <PrimaryButton
              className="rounded-[16px] bg-[#2E5D4B]"
              disabled={!name.trim()}
              label="Save changes"
              loading={updateSplitGroup.isPending}
              onPress={() => updateSplitGroup.mutate()}
            />
          </View>

          <View className="rounded-[24px] border border-[#F4D5CF] bg-[#FBEAE6] p-5">
            <Text className="text-[16px] font-black text-[#B84F40]">
              Danger zone
            </Text>
            <Text className="mt-1 text-[13px] font-bold leading-5 text-[#B56A5E]">
              Delete this split from your active split list.
            </Text>
            <Pressable
              accessibilityRole="button"
              className="mt-4 flex-row items-center justify-center gap-2 rounded-[16px] bg-[#B84F40] py-4 active:opacity-85"
              disabled={deleteSplitGroup.isPending}
              onPress={() => setDeleteConfirmVisible(true)}
            >
              <Archive color="#FFFFFF" size={18} strokeWidth={2.5} />
              <Text className="text-[15px] font-black text-white">
                Delete split
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
      <ConfirmCard
        cancelLabel="Keep split"
        confirmLabel="Delete"
        message="This will archive the split and hide it from active split lists."
        onCancel={() => setDeleteConfirmVisible(false)}
        onConfirm={() => {
          setDeleteConfirmVisible(false);
          deleteSplitGroup.mutate();
        }}
        title="Delete split?"
        visible={deleteConfirmVisible}
      />
    </SafeAreaView>
  );
}
