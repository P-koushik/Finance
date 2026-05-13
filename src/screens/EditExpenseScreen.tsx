import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EditExpenseView } from '../views/EditExpenseView';
import { useEditExpenseViewModel } from '../view-models/useEditExpenseViewModel';
import type { RootStackParamList } from '../types';

type EditExpenseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditExpense'
>;

export function EditExpenseScreen(props: EditExpenseScreenProps) {
  return <EditExpenseView {...useEditExpenseViewModel(props)} />;
}
