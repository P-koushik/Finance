import React from 'react';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { AddExpenseView } from '../views/AddExpenseView';
import { useAddExpenseViewModel } from '../view-models/useAddExpenseViewModel';
import type { RootTabParamList } from '../types';

type AddExpenseScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'AddExpense'
>;

export function AddExpenseScreen(props: AddExpenseScreenProps) {
  return <AddExpenseView {...useAddExpenseViewModel(props)} />;
}
