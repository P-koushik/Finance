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
  Mail,
  Settings,
  User,
  WalletCards,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '../components/BottomBar';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useToast } from '../components/ToastProvider';
import { formatCurrency } from '../utils/format';
import {
  getProfile,
  getSettings,
  saveProfile,
  saveSettings,
} from '../utils/storage';

export function ProfileScreen() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
        setName(profile.name);
        setEmail(profile.email);
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
        ? 'The app can save expenses and profile details on this device.'
        : 'The app will stop reading and saving expenses/profile details until you enable it again.',
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

    if (!name.trim() || !email.trim() || parsedBudget <= 0) {
      showToast({
        type: 'error',
        title: 'Missing details',
        message: 'Enter your name, email, and a positive monthly budget.',
      });
      return;
    }

    setSaving(true);
    try {
      await saveProfile({
        name: name.trim(),
        email: email.trim(),
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
            <WalletCards color="#2e62dd" size={24} strokeWidth={2.7} />
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
              <User color="#ffffff" size={36} strokeWidth={2.4} />
            </View>
            <View style={styles.summaryText}>
              <Text numberOfLines={1} style={styles.name}>
                {name || 'Your Name'}
              </Text>
              <Text numberOfLines={1} style={styles.email}>
                {email || 'email@example.com'}
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
              icon={User}
              label="Full Name"
              onChangeText={setName}
              placeholder="Your name"
              editable={localStorageEnabled}
              value={name}
            />
            <InputField
              autoCapitalize="none"
              editable={localStorageEnabled}
              icon={Mail}
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="you@example.com"
              value={email}
            />
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

          <View style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <Settings color="#124777" size={22} strokeWidth={2.5} />
              <Text style={styles.settingsTitle}>Settings</Text>
            </View>
            <View style={styles.permissionRow}>
              <View style={styles.permissionIcon}>
                <Database color="#078f84" size={21} strokeWidth={2.5} />
              </View>
              <View style={styles.permissionTextGroup}>
                <Text style={styles.permissionTitle}>Local Storage</Text>
                <Text style={styles.permissionText}>
                  Expenses and profile details are saved on this device.
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
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  brandText: {
    color: '#2b5fd7',
    fontSize: 20,
    fontWeight: '800',
  },
  budgetCard: {
    backgroundColor: '#2e5f95',
    borderRadius: 24,
    gap: 8,
    marginTop: 20,
    padding: 24,
  },
  budgetValue: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '500',
  },
  cardLabel: {
    color: '#b8c9df',
    fontSize: 15,
    fontWeight: '800',
  },
  content: {
    padding: 22,
    paddingBottom: 120,
  },
  contentKeyboardOpen: {
    paddingBottom: 320,
  },
  email: {
    color: '#74808d',
    fontSize: 15,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    gap: 24,
    marginTop: 22,
    padding: 22,
    shadowColor: '#d5dae1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    height: 64,
    paddingHorizontal: 24,
  },
  name: {
    color: '#303844',
    fontSize: 22,
    fontWeight: '900',
  },
  safeArea: {
    backgroundColor: '#f4f8fb',
    flex: 1,
  },
  saveButton: {
    marginTop: 28,
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    gap: 18,
    marginTop: 22,
    padding: 22,
    shadowColor: '#d5dae1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },
  settingsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  settingsTitle: {
    color: '#303844',
    fontSize: 18,
    fontWeight: '900',
  },
  permissionIcon: {
    alignItems: 'center',
    backgroundColor: '#e4f5f2',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  permissionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  permissionText: {
    color: '#74808d',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  permissionTextGroup: {
    flex: 1,
    gap: 4,
  },
  permissionTitle: {
    color: '#303844',
    fontSize: 15,
    fontWeight: '900',
  },
  screen: {
    backgroundColor: '#f4f8fb',
    flex: 1,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    elevation: 2,
    flexDirection: 'row',
    gap: 18,
    padding: 22,
    shadowColor: '#d5dae1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },
  summaryText: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
});
