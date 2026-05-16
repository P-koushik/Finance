import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  Square,
  SquareCheck,
  User,
  WalletCards,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthInput } from '../components/AuthInput';
import type { RootStackParamList } from '../types';
import { useSignUpViewModel } from '../view-models/useSignUpViewModel';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export function SignUpScreen(props: SignUpScreenProps) {
  const {
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
  } = useSignUpViewModel(props);

  const TermsIcon = acceptedTerms ? SquareCheck : Square;

  return (
    <SafeAreaView className="flex-1 bg-[#f5f9fc]">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f9fc" />
      <ScrollView
        contentContainerClassName="flex-grow justify-center p-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-[14px] flex-row items-center justify-center gap-2">
          <WalletCards color="#2e62dd" size={22} strokeWidth={2.7} />
          <Text className="text-[20px] font-black text-[#2b5fd7]">Finance</Text>
        </View>

        <View className="gap-4 rounded-xl bg-white p-6 shadow-lg shadow-[color:#d9e3ee]">
          <Text className="text-center text-[25px] font-black text-[#2f3742]">
            Create Account
          </Text>
          <Text className="text-center text-[15px] font-semibold leading-[21px] text-[#6b7280]">
            Start your journey to financial freedom.
          </Text>

          <View className="mt-[6px] gap-[14px]">
            <AuthInput
              icon={User}
              label="Full Name"
              onChangeText={setName}
              placeholder="John Doe"
              returnKeyType="next"
              value={name}
            />
            <AuthInput
              autoCapitalize="none"
              icon={Mail}
              keyboardType="email-address"
              label="Email Address"
              onChangeText={setEmail}
              placeholder="john@example.com"
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
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedTerms }}
            onPress={() => setAcceptedTerms(value => !value)}
            className="flex-row items-start gap-2"
          >
            <TermsIcon
              color={acceptedTerms ? '#0f8c84' : '#cbd5e1'}
              size={24}
              strokeWidth={2.5}
            />
            <Text className="flex-1 text-[14px] font-bold leading-5 text-[#6b7280]">
              I agree to the{' '}
              <Text className="text-[14px] font-black text-[#0f8c84]">
                Terms and Conditions
              </Text>{' '}
              and{' '}
              <Text className="text-[14px] font-black text-[#0f8c84]">
                Privacy Policy.
              </Text>
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={loading !== null}
            onPress={handleEmailSignUp}
            className={`h-[54px] flex-row items-center justify-center gap-2.5 rounded-[10px] bg-[#2f5f95] shadow-lg shadow-[color:#1e3f66] ${
              loading !== null ? 'opacity-[0.65]' : 'active:opacity-[0.82]'
            }`}
          >
            {loading === 'email' ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text className="text-[16px] font-extrabold text-white">
                  Sign Up
                </Text>
                <ArrowRight color="#ffffff" size={22} strokeWidth={2.5} />
              </>
            )}
          </Pressable>

          <View className="flex-row items-center gap-4">
            <View className="h-px flex-1 bg-slate-300" />
            <Text className="text-[13px] font-extrabold text-slate-400">
              OR
            </Text>
            <View className="h-px flex-1 bg-slate-300" />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={loading !== null}
            onPress={handleGoogleSignUp}
            className={`h-[52px] items-center justify-center rounded-xl border border-[#0f8c84] ${
              loading !== null ? 'opacity-[0.65]' : 'active:opacity-[0.82]'
            }`}
          >
            {loading === 'google' ? (
              <ActivityIndicator color="#0f8c84" />
            ) : (
              <Text className="text-[15px] font-black text-[#0f8c84]">
                Google
              </Text>
            )}
          </Pressable>

          <View className="flex-row items-center justify-center">
            <Text className="text-[14px] font-bold text-[#6b7280]">
              Already have an account?
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Login')}
            >
              <Text className="text-[14px] font-black text-[#0f8c84]">
                {' '}
                Sign In
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
