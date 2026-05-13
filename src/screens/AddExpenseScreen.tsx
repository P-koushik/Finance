import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AddExpenseView } from '../views/AddExpenseView';
import { useAddExpenseViewModel } from '../view-models/useAddExpenseViewModel';
import type { RootStackParamList } from '../types';

type AddExpenseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AddExpense'
>;

export function AddExpenseScreen(props: AddExpenseScreenProps) {
  return <AddExpenseView {...useAddExpenseViewModel(props)} />;
}
