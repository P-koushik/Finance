import React, { useState } from 'react';
import { Alert, StatusBar, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Scale } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { RootStackParamList } from '../types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function CreateSplitGroupScreen() {
  const navigation = useNavigation<Navigation>();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createSplitGroup = useMutation({
    mutationFn: () =>
      financeApi.createSplitGroup({
        name: name.trim(),
        description: description.trim(),
        category: 'friends',
        default_currency: 'INR',
      }),
    onSuccess: async splitGroup => {
      await queryClient.invalidateQueries({
        queryKey: financeQueryKeys.splitGroups,
      });
      navigation.replace('SplitGroupDetails', { splitGroupId: splitGroup.id });
    },
    onError: () => Alert.alert('Split group', 'Could not create split group.'),
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f4f8fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />
      <View className="gap-5 px-5 py-5">
        <InputField
          icon={Scale}
          label="Name"
          onChangeText={setName}
          placeholder="Dinner"
          value={name}
        />
        <InputField
          icon={FileText}
          label="Description"
          onChangeText={setDescription}
          placeholder="Shared payments"
          value={description}
        />
        <PrimaryButton
          disabled={!name.trim()}
          label="Create Split"
          loading={createSplitGroup.isPending}
          onPress={() => createSplitGroup.mutate()}
        />
      </View>
    </SafeAreaView>
  );
}
