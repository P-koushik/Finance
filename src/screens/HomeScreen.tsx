import React from 'react';

import { HomeView } from '../views/HomeView';
import { useHomeViewModel } from '../view-models/useHomeViewModel';

export function HomeScreen() {
  return <HomeView {...useHomeViewModel()} />;
}
