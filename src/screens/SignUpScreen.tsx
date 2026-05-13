import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { SignUpView } from '../views/SignUpView';
import { useSignUpViewModel } from '../view-models/useSignUpViewModel';
import type { RootStackParamList } from '../types';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export function SignUpScreen(props: SignUpScreenProps) {
  return <SignUpView {...useSignUpViewModel(props)} />;
}
