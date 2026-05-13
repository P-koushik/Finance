import React from 'react';

import { AllExpensesView } from '../views/AllExpensesView';
import { useAllExpensesViewModel } from '../view-models/useAllExpensesViewModel';

export function AllExpensesScreen() {
  return <AllExpensesView {...useAllExpensesViewModel()} />;
}
