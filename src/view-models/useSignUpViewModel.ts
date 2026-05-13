import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useToast } from '../components/ToastProvider';
import { getAuthErrorMessage, useAuth } from '../contexts/AuthContext';
import type { RootStackParamList } from '../types';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export function useSignUpViewModel({ navigation }: SignUpScreenProps) {
  const { authError, signUpWithEmail, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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

  const handleEmailSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      showToast({
        type: 'error',
        title: 'Missing details',
        message: 'Enter your name, email, and password.',
      });
      return;
    }

    if (!acceptedTerms) {
      showToast({
        type: 'error',
        title: 'Terms required',
        message: 'Accept the terms and privacy policy to create an account.',
      });
      return;
    }

    setLoading('email');
    try {
      await signUpWithEmail(name, email, password);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Sign up failed',
        message: getAuthErrorMessage(error),
      });
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading('google');
    try {
      await loginWithGoogle();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Google sign up failed',
        message: getAuthErrorMessage(error),
      });
    } finally {
      setLoading(null);
    }
  };

  return {
    acceptedTerms,
    email,
    handleEmailSignUp,
    handleGoogleSignUp,
    loading,
    name,
    navigation,
    password,
    passwordVisible,
    setAcceptedTerms,
    setEmail,
    setName,
    setPassword,
    setPasswordVisible,
  };
}
