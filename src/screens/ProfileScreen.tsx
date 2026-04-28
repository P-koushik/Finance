import React, { useCallback, useEffect, useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  BadgeIndianRupee,
  Database,
  Settings,
  User,
  WalletCards,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '../components/BottomBar';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';
import {
  getProfile,
  getSettings,
  saveProfile,
  saveSettings,
} from '../utils/storage';

export function ProfileScreen() {
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const [storedName, setStoredName] = useState('');
  const [storedEmail, setStoredEmail] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [localStorageEnabled, setLocalStorageEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        const [profile, settings] = await Promise.all([
          getProfile(),
          getSettings(),
        ]);
        setStoredName(profile.name);
        setStoredEmail(profile.email);
        setMonthlyBudget(String(profile.monthlyBudget));
        setLocalStorageEnabled(settings.localStorageEnabled);
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

  const handleStorageToggle = async (enabled: boolean) => {
    setLocalStorageEnabled(enabled);
    await saveSettings({
      localStorageEnabled: enabled,
      storagePermissionAsked: true,
    });

    showToast({
      type: enabled ? 'success' : 'info',
      title: enabled ? 'Local storage enabled' : 'Local storage disabled',
      message: enabled
        ? 'The app can save expenses and your monthly budget on this device.'
        : 'The app will stop reading and saving expenses/budget details until you enable it again.',
    });
  };

  const handleSave = async () => {
    if (!localStorageEnabled) {
      showToast({
        type: 'error',
        title: 'Storage disabled',
        message:
          'Turn on Local Storage in Settings before saving profile details.',
      });
      return;
    }

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
              editable={localStorageEnabled}
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
            disabled={saving || !localStorageEnabled}
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

          <View style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <Settings color="#124777" size={20} strokeWidth={2.5} />
              <Text style={styles.settingsTitle}>Settings</Text>
            </View>
            <View style={styles.permissionRow}>
              <View style={styles.permissionIcon}>
                <Database color="#078f84" size={19} strokeWidth={2.5} />
              </View>
              <View style={styles.permissionTextGroup}>
                <Text style={styles.permissionTitle}>Local Storage</Text>
                <Text style={styles.permissionText}>
                  Expenses and your monthly budget are saved on this device.
                </Text>
              </View>
              <Switch
                onValueChange={handleStorageToggle}
                thumbColor={localStorageEnabled ? '#ffffff' : '#f4f4f5'}
                trackColor={{ false: '#cbd5e1', true: '#75e5df' }}
                value={localStorageEnabled}
              />
            </View>
          </View>
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
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    gap: 14,
    marginTop: 18,
    padding: 18,
    shadowColor: '#d5dae1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },
  settingsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  settingsTitle: {
    color: '#303844',
    fontSize: 16,
    fontWeight: '900',
  },
  permissionIcon: {
    alignItems: 'center',
    backgroundColor: '#e4f5f2',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  permissionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  permissionText: {
    color: '#74808d',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  permissionTextGroup: {
    flex: 1,
    gap: 4,
  },
  permissionTitle: {
    color: '#303844',
    fontSize: 14,
    fontWeight: '900',
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
