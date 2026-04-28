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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f9fc" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <WalletCards color="#2e62dd" size={22} strokeWidth={2.7} />
          <Text style={styles.brandText}>Finance</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to manage your finances with clarity.
          </Text>

          <View style={styles.form}>
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
                <Text style={styles.primaryButtonText}>Login</Text>
                <ArrowRight color="#ffffff" size={22} strokeWidth={2.5} />
              </>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.divider} />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={loading !== null}
            onPress={handleGoogleLogin}
            style={({ pressed }) => [
              styles.socialButton,
              pressed && styles.pressed,
              loading && styles.disabled,
            ]}
          >
            {loading === 'google' ? (
              <ActivityIndicator color="#124777" />
            ) : (
              <Text style={styles.socialText}>Google</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don’t have an account?</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.linkText}> Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 72,
  },
  brandText: {
    color: '#2b5fd7',
    fontSize: 20,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    elevation: 6,
    gap: 18,
    padding: 24,
    shadowColor: '#d9e3ee',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.75,
    shadowRadius: 26,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
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
    marginTop: 4,
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 26,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '700',
  },
  form: {
    gap: 16,
    marginTop: 6,
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
    gap: 10,
    height: 54,
    justifyContent: 'center',
    shadowColor: '#1e3f66',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  safeArea: {
    backgroundColor: '#f5f9fc',
    flex: 1,
  },
  socialButton: {
    alignItems: 'center',
    borderColor: '#cbd5e1',
    borderRadius: 12,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
  },
  socialText: {
    color: '#2f3742',
    fontSize: 15,
    fontWeight: '900',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    textAlign: 'center',
  },
  title: {
    color: '#143f6d',
    fontSize: 27,
    fontWeight: '900',
    textAlign: 'center',
  },
});
