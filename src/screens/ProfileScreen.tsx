import React, { useCallback, useEffect, useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BadgeIndianRupee, User, WalletCards } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '../components/BottomBar';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';
import { getProfile, saveProfile } from '../utils/storage';

export function ProfileScreen() {
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const [storedName, setStoredName] = useState('');
  const [storedEmail, setStoredEmail] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [saving, setSaving] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        const profile = await getProfile();
        setStoredName(profile.name);
        setStoredEmail(profile.email);
        setMonthlyBudget(String(profile.monthlyBudget));
      };

      loadProfile();
    }, []),
  );

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const parsedBudget = Number(monthlyBudget.replace(/,/g, ''));
  const profileName = user?.displayName || storedName || 'Your Name';
  const profileEmail = user?.email || storedEmail || 'email@example.com';

  const handleSave = async () => {
    if (parsedBudget <= 0) {
      showToast({
        type: 'error',
        title: 'Missing budget',
        message: 'Enter a positive monthly budget.',
      });
      return;
    }

    setSaving(true);
    try {
      await saveProfile({
        name: profileName,
        email: profileEmail,
        monthlyBudget: parsedBudget,
      });
      showToast({
        type: 'success',
        title: 'Profile saved',
        message: 'Your monthly budget is now used on Home.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <WalletCards color="#2e62dd" size={22} strokeWidth={2.7} />
            <Text style={styles.brandText}>Profile</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            keyboardVisible && styles.contentKeyboardOpen,
          ]}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <View style={styles.avatar}>
              <User color="#ffffff" size={30} strokeWidth={2.4} />
            </View>
            <View style={styles.summaryText}>
              <Text numberOfLines={1} style={styles.name}>
                {profileName}
              </Text>
              <Text numberOfLines={1} style={styles.email}>
                {profileEmail}
              </Text>
            </View>
          </View>

          <View style={styles.budgetCard}>
            <Text style={styles.cardLabel}>Monthly Budget</Text>
            <Text style={styles.budgetValue}>
              {formatCurrency(parsedBudget > 0 ? parsedBudget : 0)}
            </Text>
          </View>

          <View style={styles.formCard}>
            <InputField
              icon={BadgeIndianRupee}
              keyboardType="decimal-pad"
              label="Monthly Budget"
              onChangeText={setMonthlyBudget}
              placeholder="50000"
              prefix="₹"
              value={monthlyBudget}
            />
          </View>

          <PrimaryButton
            disabled={saving}
            label="Save Profile"
            loading={saving}
            onPress={handleSave}
            style={styles.saveButton}
          />

          <PrimaryButton
            label="Sign Out"
            onPress={logout}
            style={styles.signOutButton}
          />
        </ScrollView>

        {!keyboardVisible ? <BottomBar active="profile" /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#078f84',
    borderRadius: 29,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  brandText: {
    color: '#2b5fd7',
    fontSize: 18,
    fontWeight: '800',
  },
  budgetCard: {
    backgroundColor: '#2e5f95',
    borderRadius: 18,
    gap: 6,
    marginTop: 16,
    padding: 20,
  },
  budgetValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '500',
  },
  cardLabel: {
    color: '#b8c9df',
    fontSize: 14,
    fontWeight: '800',
  },
  content: {
    padding: 18,
    paddingBottom: 120,
  },
  contentKeyboardOpen: {
    paddingBottom: 320,
  },
  email: {
    color: '#74808d',
    fontSize: 14,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    gap: 20,
    marginTop: 18,
    padding: 18,
    shadowColor: '#d5dae1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    height: 58,
    paddingHorizontal: 20,
  },
  name: {
    color: '#303844',
    fontSize: 19,
    fontWeight: '900',
  },
  safeArea: {
    backgroundColor: '#f4f8fb',
    flex: 1,
  },
  saveButton: {
    marginTop: 22,
  },
  signOutButton: {
    backgroundColor: '#be123c',
    marginTop: 12,
  },
  screen: {
    backgroundColor: '#f4f8fb',
    flex: 1,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    elevation: 2,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    shadowColor: '#d5dae1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },
  summaryText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
});
