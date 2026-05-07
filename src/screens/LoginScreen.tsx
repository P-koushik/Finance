import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  WalletCards,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthInput } from '../components/AuthInput';
import { useToast } from '../components/ToastProvider';
import { getAuthErrorMessage, useAuth } from '../contexts/AuthContext';
import type { RootStackParamList } from '../types';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState<'email' | 'google' | null>(null);

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

  return (
    <SafeAreaView className="flex-1 bg-[#f5f9fc]">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f9fc" />
      <ScrollView
        contentContainerClassName="flex-grow justify-center p-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-[72px] flex-row items-center justify-center gap-2">
          <WalletCards color="#2e62dd" size={22} strokeWidth={2.7} />
          <Text className="text-[20px] font-black text-[#2b5fd7]">Finance</Text>
        </View>

        <View className="gap-[18px] rounded-3xl bg-white p-6 shadow-lg shadow-[#d9e3ee]">
          <Text className="text-center text-[27px] font-black text-[#143f6d]">
            Welcome Back
          </Text>
          <Text className="text-center text-[15px] font-semibold leading-[21px] text-[#6b7280]">
            Sign in to manage your finances with clarity.
          </Text>

          <View className="mt-[6px] gap-4">
            <AuthInput
              autoCapitalize="none"
              icon={Mail}
              keyboardType="email-address"
              label="Email Address"
              onChangeText={setEmail}
              placeholder="name@company.com"
              returnKeyType="next"
              value={email}
            />
            <AuthInput
              icon={LockKeyhole}
              label="Password"
              onChangeText={setPassword}
              onToggleSecure={() => setPasswordVisible(value => !value)}
              placeholder="••••••••"
              returnKeyType="done"
              secureTextEntry={!passwordVisible}
              secureVisible={passwordVisible}
              value={password}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={loading !== null}
            onPress={handleEmailLogin}
            className={`h-[54px] flex-row items-center justify-center gap-2.5 rounded-[10px] bg-[#2f5f95] shadow-lg shadow-[#1e3f66] ${
              loading !== null ? 'opacity-[0.65]' : 'active:opacity-[0.82]'
            }`}
          >
            {loading === 'email' ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text className="text-[16px] font-extrabold text-white">
                  Login
                </Text>
                <ArrowRight color="#ffffff" size={22} strokeWidth={2.5} />
              </>
            )}
          </Pressable>

          <View className="mt-1 flex-row items-center gap-4">
            <View className="h-px flex-1 bg-slate-300" />
            <Text className="text-[13px] font-bold text-slate-400">
              Or continue with
            </Text>
            <View className="h-px flex-1 bg-slate-300" />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={loading !== null}
            onPress={handleGoogleLogin}
            className={`h-[52px] items-center justify-center rounded-xl border border-slate-300 ${
              loading !== null ? 'opacity-[0.65]' : 'active:opacity-[0.82]'
            }`}
          >
            {loading === 'google' ? (
              <ActivityIndicator color="#124777" />
            ) : (
              <Text className="text-[15px] font-black text-[#2f3742]">
                Google
              </Text>
            )}
          </Pressable>
        </View>

        <View className="mt-[26px] flex-row items-center justify-center">
          <Text className="text-[15px] font-bold text-[#6b7280]">
            Don’t have an account?
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text className="text-[15px] font-black text-[#0f8c84]">
              {' '}
              Sign Up
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
