import { useCallback, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DateData } from 'react-native-calendars';

import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { financeApi, financeQueryKeys } from '../services/finance-api';
import { defaultProfile } from '../utils/profile';

export function useProfileViewModel() {
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [monthlyCreditDay, setMonthlyCreditDay] = useState(
    String(defaultProfile.monthlyCreditDay),
  );
  const [dayPickerVisible, setDayPickerVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { data: profileBalance = defaultProfile, refetch } = useQuery({
    queryKey: financeQueryKeys.profile,
    queryFn: financeApi.getProfile,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    setMonthlyBudget(
      profileBalance.monthlyBudget ? String(profileBalance.monthlyBudget) : '',
    );
    setMonthlyCreditDay(String(profileBalance.monthlyCreditDay));
  }, [profileBalance]);

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
  const parsedCreditDay = Number(monthlyCreditDay);
  const profileName = user?.displayName || profileBalance.name || 'Your Name';
  const profileEmail =
    user?.email || profileBalance.email || 'email@example.com';
  const today = new Date();
  const selectedCalendarDay = Math.min(
    parsedCreditDay || defaultProfile.monthlyCreditDay,
    new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(),
  );
  const selectedDateKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, '0')}-${String(selectedCalendarDay).padStart(2, '0')}`;

  const updateMutation = useMutation({
    mutationFn: () =>
      financeApi.updateProfile({
        monthlyBudget: parsedBudget,
        monthlyCreditDay: parsedCreditDay,
      }),
    onSuccess: async nextProfile => {
      queryClient.setQueryData(financeQueryKeys.profile, nextProfile);
      await queryClient.invalidateQueries({
        queryKey: financeQueryKeys.profile,
      });
      showToast({
        type: 'success',
        title: 'Profile saved',
        message: 'Your monthly amount is now used on Home.',
      });
    },
  });

  const handleSave = async () => {
    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      showToast({
        type: 'error',
        title: 'Missing budget',
        message: 'Enter a positive monthly budget.',
      });
      return;
    }

    if (
      !Number.isInteger(parsedCreditDay) ||
      parsedCreditDay < 1 ||
      parsedCreditDay > 31
    ) {
      showToast({
        type: 'error',
        title: 'Invalid credit day',
        message: 'Choose a day between 1 and 31.',
      });
      return;
    }

    await updateMutation.mutateAsync();
  };

  const handleDayPress = (day: DateData) => {
    setMonthlyCreditDay(String(day.day));
    setDayPickerVisible(false);
  };

  return {
    dayPickerVisible,
    handleDayPress,
    handleSave,
    keyboardVisible,
    logout,
    monthlyBudget,
    monthlyCreditDay,
    parsedBudget,
    parsedCreditDay,
    profileEmail,
    profileName,
    saving: updateMutation.isPending,
    selectedDateKey,
    setDayPickerVisible,
    setMonthlyBudget,
  };
}
