import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useToast } from '../components/ToastProvider';
import { getAuthErrorMessage, useAuth } from '../contexts/AuthContext';
import type { RootStackParamList } from '../types';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function useLoginViewModel({ navigation }: LoginScreenProps) {
  const { authError, loginWithEmail, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState<'email' | 'google' | null>(null);

  useEffect(() => {
    if (!authError) {
      return;
    }

    showToast({
      type: 'error',
      title: 'Backend sign-in failed',
      message: getAuthErrorMessage(authError),
    });
  }, [authError, showToast]);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      showToast({
        type: 'error',
        title: 'Missing details',
        message: 'Enter your email and password.',
      });
      return;
    }

    setLoading('email');
    try {
      await loginWithEmail(email, password);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Login failed',
        message: getAuthErrorMessage(error),
      });
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      await loginWithGoogle();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Google login failed',
        message: getAuthErrorMessage(error),
      });
    } finally {
      setLoading(null);
    }
  };

  return {
    email,
    handleEmailLogin,
    handleGoogleLogin,
    loading,
    navigation,
    password,
    passwordVisible,
    setEmail,
    setPassword,
    setPasswordVisible,
  };
}
