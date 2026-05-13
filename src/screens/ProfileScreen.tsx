import React from 'react';

import { ProfileView } from '../views/ProfileView';
import { useProfileViewModel } from '../view-models/useProfileViewModel';

export function ProfileScreen() {
  return <ProfileView {...useProfileViewModel()} />;
}
