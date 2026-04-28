import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { useToast } from '../components/ToastProvider';
import { getAuthErrorMessage, useAuth } from '../contexts/AuthContext';
import type { RootStackParamList } from '../types';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: SignUpScreenProps) {
  const { signUpWithEmail, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState<'email' | 'google' | null>(null);

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

  const TermsIcon = acceptedTerms ? SquareCheck : Square;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f9fc" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <WalletCards color="#2e62dd" size={25} strokeWidth={2.7} />
          <Text style={styles.brandText}>FinTrack</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Start your journey to financial freedom.
          </Text>

          <View style={styles.form}>
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
            style={styles.termsRow}
          >
            <TermsIcon
              color={acceptedTerms ? '#0f8c84' : '#cbd5e1'}
              size={24}
              strokeWidth={2.5}
            />
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.linkText}>Terms and Conditions</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy.</Text>
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={loading !== null}
            onPress={handleEmailSignUp}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              loading && styles.disabled,
            ]}
          >
            {loading === 'email' ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Sign Up</Text>
                <ArrowRight color="#ffffff" size={22} strokeWidth={2.5} />
              </>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={loading !== null}
            onPress={handleGoogleSignUp}
            style={({ pressed }) => [
              styles.socialButton,
              pressed && styles.pressed,
              loading && styles.disabled,
            ]}
          >
            {loading === 'google' ? (
              <ActivityIndicator color="#0f8c84" />
            ) : (
              <Text style={styles.socialText}>Google</Text>
            )}
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.linkText}> Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 18,
  },
  brandText: {
    color: '#2b5fd7',
    fontSize: 22,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 6,
    gap: 22,
    padding: 28,
    shadowColor: '#d9e3ee',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.75,
    shadowRadius: 26,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
  },
  disabled: {
    opacity: 0.65,
  },
  divider: {
    backgroundColor: '#cbd5e1',
    flex: 1,
    height: 1,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '800',
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '700',
  },
  form: {
    gap: 18,
    marginTop: 10,
  },
  linkText: {
    color: '#0f8c84',
    fontSize: 15,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.82,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2f5f95',
    borderRadius: 10,
    elevation: 5,
    flexDirection: 'row',
    gap: 12,
    height: 62,
    justifyContent: 'center',
    shadowColor: '#1e3f66',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  safeArea: {
    backgroundColor: '#f5f9fc',
    flex: 1,
  },
  socialButton: {
    alignItems: 'center',
    borderColor: '#0f8c84',
    borderRadius: 12,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
  },
  socialText: {
    color: '#0f8c84',
    fontSize: 16,
    fontWeight: '900',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
    textAlign: 'center',
  },
  termsRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  termsText: {
    color: '#6b7280',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  title: {
    color: '#2f3742',
    fontSize: 27,
    fontWeight: '900',
    textAlign: 'center',
  },
});
