import React, { useState } from 'react';
import { Alert, StatusBar, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, UsersRound } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { RootStackParamList } from '../types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function CreateGroupScreen() {
  const navigation = useNavigation<Navigation>();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createGroup = useMutation({
    mutationFn: () =>
      financeApi.createGroup({
        name: name.trim(),
        description: description.trim(),
        category: 'family',
        default_currency: 'INR',
      }),
    onSuccess: async group => {
      await queryClient.invalidateQueries({
        queryKey: financeQueryKeys.groups,
      });
      navigation.replace('GroupDetails', { groupId: group.id });
    },
    onError: () => Alert.alert('Group', 'Could not create group.'),
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f4f8fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />
      <View className="gap-5 px-5 py-5">
        <InputField
          icon={UsersRound}
          label="Name"
          onChangeText={setName}
          placeholder="Family"
          value={name}
        />
        <InputField
          icon={FileText}
          label="Description"
          onChangeText={setDescription}
          placeholder="Monthly shared expenses"
          value={description}
        />
        <PrimaryButton
          disabled={!name.trim()}
          label="Create Group"
          loading={createGroup.isPending}
          onPress={() => createGroup.mutate()}
        />
      </View>
    </SafeAreaView>
  );
}
