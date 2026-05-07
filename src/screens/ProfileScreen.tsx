import React, { useCallback, useEffect, useState } from 'react';
import { Keyboard, ScrollView, StatusBar, Text, View } from 'react-native';
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
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f4f8fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />
      <View className="flex-1 bg-[#f4f8fb]">
        <View className="h-[58px] flex-row items-center bg-white px-5">
          <View className="flex-row items-center gap-2">
            <WalletCards color="#2e62dd" size={22} strokeWidth={2.7} />
            <Text className="text-[18px] font-extrabold text-[#2b5fd7]">
              Profile
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerClassName={`p-[18px] ${
            keyboardVisible ? 'pb-[320px]' : 'pb-[120px]'
          }`}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center gap-[14px] rounded-[18px] bg-white p-[18px] shadow-md shadow-[#d5dae1]">
            <View className="h-[58px] w-[58px] items-center justify-center rounded-[29px] bg-[#078f84]">
              <User color="#ffffff" size={30} strokeWidth={2.4} />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text
                numberOfLines={1}
                className="text-[19px] font-black text-[#303844]"
              >
                {profileName}
              </Text>
              <Text
                numberOfLines={1}
                className="text-[14px] font-bold text-[#74808d]"
              >
                {profileEmail}
              </Text>
            </View>
          </View>

          <View className="mt-4 gap-1.5 rounded-[18px] bg-[#2e5f95] p-5">
            <Text className="text-[14px] font-extrabold text-[#b8c9df]">
              Monthly Budget
            </Text>
            <Text className="text-[28px] font-medium text-white">
              {formatCurrency(parsedBudget > 0 ? parsedBudget : 0)}
            </Text>
          </View>

          <View className="mt-[18px] gap-5 rounded-xl bg-white p-[18px] shadow-md shadow-[#d5dae1]">
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
            className="mt-[22px]"
            disabled={saving}
            label="Save Profile"
            loading={saving}
            onPress={handleSave}
          />

          <PrimaryButton
            className="mt-3 bg-[#be123c]"
            label="Sign Out"
            onPress={logout}
          />
        </ScrollView>

        {!keyboardVisible ? <BottomBar active="profile" /> : null}
      </View>
    </SafeAreaView>
  );
}
