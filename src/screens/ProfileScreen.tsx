import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {
  BadgeIndianRupee,
  CalendarDays,
  LogOut,
  Mail,
  Pencil,
  PiggyBank,
  User,
  WalletCards,
} from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { formatCurrency } from '../utils/format';
import { defaultProfile } from '../utils/profile';
import { useProfileViewModel } from '../view-models/useProfileViewModel';

export function ProfileScreen() {
  const {
    availableAmount,
    dayPickerVisible,
    handleDayPress,
    handleSave,
    isEditing,
    keyboardVisible,
    logout,
    monthlyBudget,
    parsedAvailableAmount,
    parsedCreditDay,
    parsedSavingsAmount,
    profileEmail,
    profileName,
    profilePicture,
    refresh,
    refreshing,
    saving,
    selectedDateKey,
    setAvailableAmount,
    setDayPickerVisible,
    setIsEditing,
    setMonthlyBudget,
    setSavingsAmount,
    savingsAmount,
  } = useProfileViewModel();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#EEF4EE]">
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />
      <View className="flex-1 bg-[#EEF4EE]">
        <ScrollView
          contentContainerClassName={`px-5 pt-3 ${
            keyboardVisible ? 'pb-[320px]' : 'pb-[130px]'
          }`}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            isEditing ? undefined : (
              <RefreshControl
                colors={['#2E5D4B']}
                onRefresh={refresh}
                refreshing={refreshing}
                tintColor="#2E5D4B"
              />
            )
          }
          showsVerticalScrollIndicator={false}
        >
          <Text className="pb-5 text-[24px] font-black text-[#24352E]">
            Profile
          </Text>

          <View className="mb-6 items-center">
            <View className="h-24 w-24 items-center justify-center rounded-[32px] bg-[#2E5D4B]">
              {profilePicture ? (
                <Image
                  className="h-full w-full rounded-[32px]"
                  source={{ uri: profilePicture }}
                />
              ) : (
                <User color="#ffffff" size={36} strokeWidth={2.4} />
              )}
            </View>
            <Text
              className="mt-[14px] text-[21px] font-black text-[#24352E]"
              numberOfLines={1}
            >
              {profileName}
            </Text>
            <View className="mt-1 flex-row items-center gap-1.5">
              <Mail color="#8D9B93" size={14} strokeWidth={2.4} />
              <Text
                className="text-[14px] font-bold text-[#8D9B93]"
                numberOfLines={1}
              >
                {profileEmail}
              </Text>
            </View>
          </View>

          <View className="mb-3 flex-row gap-3">
            <View className="flex-1 rounded-[22px] border border-[#EDF3ED] bg-white p-4">
              <WalletCards color="#2E5D4B" size={22} strokeWidth={2.5} />
              <Text className="mt-2 text-[12px] font-extrabold text-[#9AA8A0]">
                Balance
              </Text>
              <Text
                className="text-[19px] font-black text-[#24352E]"
                numberOfLines={1}
              >
                {formatCurrency(
                  parsedAvailableAmount > 0 ? parsedAvailableAmount : 0,
                )}
              </Text>
            </View>
            <View className="flex-1 rounded-[22px] border border-[#EDF3ED] bg-white p-4">
              <PiggyBank color="#7FA968" size={22} strokeWidth={2.5} />
              <Text className="mt-2 text-[12px] font-extrabold text-[#9AA8A0]">
                Savings
              </Text>
              <Text
                className="text-[19px] font-black text-[#24352E]"
                numberOfLines={1}
              >
                {formatCurrency(
                  parsedSavingsAmount > 0 ? parsedSavingsAmount : 0,
                )}
              </Text>
            </View>
          </View>

          <View className="mb-5 flex-row items-center gap-[13px] rounded-[22px] border border-[#EDF3ED] bg-white px-[18px] py-4">
            <View className="h-[42px] w-[42px] items-center justify-center rounded-[13px] bg-[#EAF2EA]">
              <CalendarDays color="#2E5D4B" size={22} strokeWidth={2.4} />
            </View>
            <View className="flex-1">
              <Text className="text-[12px] font-extrabold text-[#9AA8A0]">
                Salary credit date
              </Text>
              <Text className="text-[15.5px] font-black text-[#24352E]">
                Day {parsedCreditDay || defaultProfile.income_day} of every
                month
              </Text>
            </View>
          </View>

          <View className="gap-3 rounded-[22px] border border-[#EDF3ED] bg-white p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-[18px] font-black text-[#24352E]">
                Account Details
              </Text>
              <Pressable
                accessibilityLabel={
                  isEditing ? 'Done editing' : 'Edit account details'
                }
                accessibilityRole="button"
                className="flex-row items-center gap-1.5 active:opacity-60"
                onPress={() => setIsEditing(prev => !prev)}
              >
                <Pencil color="#6E9081" size={14} strokeWidth={2.4} />
                <Text className="text-[13px] font-extrabold text-[#6E9081]">
                  {isEditing ? 'Done' : 'Edit'}
                </Text>
              </Pressable>
            </View>

            <InputField
              editable={isEditing}
              icon={BadgeIndianRupee}
              keyboardType="decimal-pad"
              label="Monthly Amount"
              onChangeText={setMonthlyBudget}
              placeholder="0"
              prefix="₹"
              value={monthlyBudget}
            />
            <InputField
              editable={isEditing}
              icon={BadgeIndianRupee}
              keyboardType="decimal-pad"
              label="Available Amount"
              onChangeText={setAvailableAmount}
              placeholder="0"
              prefix="₹"
              value={availableAmount}
            />
            <InputField
              editable={isEditing}
              icon={BadgeIndianRupee}
              keyboardType="decimal-pad"
              label="Savings Amount"
              onChangeText={setSavingsAmount}
              placeholder="0"
              prefix="₹"
              value={savingsAmount}
            />

            <View className="gap-2">
              <Text className="text-[14px] font-extrabold text-[#6E9081]">
                Monthly Credit Day
              </Text>
              <Pressable
                accessibilityRole="button"
                className={`h-[50px] flex-row items-center gap-3 rounded-[16px] bg-[#F1F6F1] px-4 ${
                  isEditing ? 'active:opacity-70' : 'opacity-50'
                }`}
                disabled={!isEditing}
                onPress={() => setDayPickerVisible(true)}
              >
                <CalendarDays color="#6E9081" size={22} strokeWidth={2.4} />
                <Text className="text-[15px] font-bold text-[#24352E]">
                  Day {parsedCreditDay || defaultProfile.income_day} of every
                  month
                </Text>
              </Pressable>
            </View>
          </View>

          {isEditing ? (
            <PrimaryButton
              className="mt-[22px] rounded-[18px] bg-[#2E5D4B]"
              disabled={saving}
              label="Save Profile"
              loading={saving}
              onPress={handleSave}
            />
          ) : null}

          <View className="mt-5 rounded-[22px] border border-[#EDF3ED] bg-white px-4 py-1">
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center gap-[13px] py-[14px] active:opacity-70"
              onPress={logout}
            >
              <View className="h-[38px] w-[38px] items-center justify-center rounded-[12px] bg-[#F8E9E5]">
                <LogOut color="#C4614E" size={20} strokeWidth={2.5} />
              </View>
              <Text className="flex-1 text-[15px] font-extrabold text-[#C4614E]">
                Log out
              </Text>
            </Pressable>
          </View>

          <Text className="mt-5 text-center text-[12px] font-bold text-[#B4C2BA]">
            Finance · v1.0
          </Text>
        </ScrollView>

        <Modal
          animationType="fade"
          onRequestClose={() => setDayPickerVisible(false)}
          transparent
          visible={dayPickerVisible}
        >
          <View className="flex-1 items-center justify-center bg-[#1D2A24]/50">
            <View className="mx-6 gap-4 rounded-[26px] border border-[#E3ECE4] bg-white p-[22px]">
              <Text className="text-[18px] font-black text-[#24352E]">
                Choose Monthly Credit Day
              </Text>
              <Calendar
                current={selectedDateKey}
                markedDates={{
                  [selectedDateKey]: {
                    selected: true,
                    selectedColor: '#2E5D4B',
                    selectedTextColor: '#ffffff',
                  },
                }}
                onDayPress={handleDayPress}
                theme={{
                  arrowColor: '#2E5D4B',
                  monthTextColor: '#24352E',
                  selectedDayBackgroundColor: '#2E5D4B',
                  textDayFontWeight: '600',
                  textMonthFontWeight: '900',
                  textSectionTitleColor: '#6E9081',
                  todayTextColor: '#2E5D4B',
                }}
              />
              <PrimaryButton
                className="h-[50px] rounded-[16px] bg-[#2E5D4B]"
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
