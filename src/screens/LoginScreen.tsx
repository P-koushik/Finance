import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { LoginView } from '../views/LoginView';
import { useLoginViewModel } from '../view-models/useLoginViewModel';
import type { RootStackParamList } from '../types';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen(props: LoginScreenProps) {
  return <LoginView {...useLoginViewModel(props)} />;
}
