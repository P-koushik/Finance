import React from 'react';

import { SavingsView } from '../views/SavingsView';
import { useSavingsViewModel } from '../view-models/useSavingsViewModel';

export function SavingsScreen() {
  return <SavingsView {...useSavingsViewModel()} />;
}
