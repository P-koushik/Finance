import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {
  BadgeIndianRupee,
  CalendarDays,
  User,
  WalletCards,
} from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '../components/BottomBar';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { formatCurrency } from '../utils/format';
import { defaultProfile } from '../utils/profile';
import type { useProfileViewModel } from '../view-models/useProfileViewModel';

type ProfileViewProps = ReturnType<typeof useProfileViewModel>;

export function ProfileView({
  availableAmount,
  dayPickerVisible,
  handleDayPress,
  handleSave,
  keyboardVisible,
  logout,
  monthlyBudget,
  name,
  parsedAvailableAmount,
  parsedBudget,
  parsedCreditDay,
  parsedSavingsAmount,
  profileEmail,
  profileName,
  saving,
  selectedDateKey,
  setAvailableAmount,
  setDayPickerVisible,
  setMonthlyBudget,
  setName,
  setSavingsAmount,
  savingsAmount,
}: ProfileViewProps) {
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
          <View className="flex-row items-center gap-[14px] rounded-[18px] bg-white p-[18px] shadow-md shadow-[color:#d5dae1]">
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
              Monthly Amount
            </Text>
            <Text className="text-[28px] font-medium text-white">
              {formatCurrency(parsedBudget > 0 ? parsedBudget : 0)}
            </Text>
            <Text className="text-[13px] font-bold text-[#b8c9df]">
              Credits on day{' '}
              {parsedCreditDay || defaultProfile.monthlyCreditDay} each month
            </Text>
          </View>

          <View className="mt-3 flex-row gap-2.5">
            <View className="flex-1 rounded-[14px] bg-white p-3">
              <Text className="text-[12px] font-bold text-[#6c7480]">
                Available
              </Text>
              <Text
                className="mt-1.5 text-[14px] font-extrabold text-[#2c5c8d]"
                numberOfLines={1}
              >
                {formatCurrency(
                  parsedAvailableAmount > 0 ? parsedAvailableAmount : 0,
                )}
              </Text>
            </View>

            <View className="flex-1 rounded-[14px] bg-white p-3">
              <Text className="text-[12px] font-bold text-[#6c7480]">
                Savings
              </Text>
              <Text
                className="mt-1.5 text-[14px] font-extrabold text-[#2c5c8d]"
                numberOfLines={1}
              >
                {formatCurrency(
                  parsedSavingsAmount > 0 ? parsedSavingsAmount : 0,
                )}
              </Text>
            </View>
          </View>

          <View className="mt-[18px] gap-5 rounded-xl bg-white p-[18px] shadow-md shadow-[color:#d5dae1]">
            <InputField
              autoCapitalize="words"
              icon={User}
              label="Name"
              onChangeText={setName}
              placeholder="Your name"
              value={name}
            />

            <InputField
              icon={BadgeIndianRupee}
              keyboardType="decimal-pad"
              label="Monthly Amount"
              onChangeText={setMonthlyBudget}
              placeholder="0"
              prefix="₹"
              value={monthlyBudget}
            />

            <InputField
              icon={BadgeIndianRupee}
              keyboardType="decimal-pad"
              label="Available Amount"
              onChangeText={setAvailableAmount}
              placeholder="0"
              prefix="₹"
              value={availableAmount}
            />

            <InputField
              icon={BadgeIndianRupee}
              keyboardType="decimal-pad"
              label="Savings Amount"
              onChangeText={setSavingsAmount}
              placeholder="0"
              prefix="₹"
              value={savingsAmount}
            />

            <View className="gap-2">
              <Text className="text-[14px] font-semibold text-[#686e78]">
                Monthly Credit Day
              </Text>
              <Pressable
                accessibilityRole="button"
                className="h-[50px] flex-row items-center gap-3 rounded-lg bg-[#eef1f4] px-4 active:opacity-70"
                onPress={() => setDayPickerVisible(true)}
              >
                <CalendarDays color="#747c88" size={22} strokeWidth={2.4} />
                <Text className="text-[15px] font-bold text-[#626a75]">
                  Day {parsedCreditDay || defaultProfile.monthlyCreditDay} of
                  every month
                </Text>
              </Pressable>
            </View>
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

        <Modal
          animationType="fade"
          transparent
          visible={dayPickerVisible}
          onRequestClose={() => setDayPickerVisible(false)}
        >
          <View className="flex-1 items-center justify-center bg-slate-900/40">
            <View className="mx-6 gap-4 rounded-[18px] bg-white p-5">
              <Text className="text-[18px] font-extrabold text-[#2f3742]">
                Choose Monthly Credit Day
              </Text>
              <Calendar
                current={selectedDateKey}
                markedDates={{
                  [selectedDateKey]: {
                    selected: true,
                    selectedColor: '#078f84',
                    selectedTextColor: '#ffffff',
                  },
                }}
                onDayPress={handleDayPress}
                theme={{
                  arrowColor: '#124777',
                  monthTextColor: '#2f3742',
                  selectedDayBackgroundColor: '#078f84',
                  textDayFontWeight: '600',
                  textMonthFontWeight: '900',
                  textSectionTitleColor: '#6f7782',
                  todayTextColor: '#2e62dd',
                }}
              />
              <PrimaryButton
                className="h-[50px]"
                label="Close Calendar"
                onPress={() => setDayPickerVisible(false)}
              />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
