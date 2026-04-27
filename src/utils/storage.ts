import AsyncStorage from '@react-native-async-storage/async-storage';

import type {AppSettings, Expense, UserProfile} from '../types';

const EXPENSES_KEY = 'expenses';
const PROFILE_KEY = 'profile';
const SETTINGS_KEY = 'settings';

export const defaultProfile: UserProfile = {
  name: 'Koushik',
  email: 'koushik@example.com',
  monthlyBudget: 50000,
};

export const defaultSettings: AppSettings = {
  localStorageEnabled: false,
  storagePermissionAsked: false,
};

const isExpense = (value: unknown): value is Expense => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const expense = value as Expense;
  return (
    typeof expense.id === 'string' &&
    typeof expense.title === 'string' &&
    typeof expense.amount === 'number' &&
    typeof expense.createdAt === 'string'
  );
};

const isProfile = (value: unknown): value is UserProfile => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const profile = value as UserProfile;
  return (
    typeof profile.name === 'string' &&
    typeof profile.email === 'string' &&
    typeof profile.monthlyBudget === 'number'
  );
};

const parseSettings = (value: unknown): AppSettings | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const settings = value as AppSettings;
  if (typeof settings.localStorageEnabled !== 'boolean') {
    return null;
  }

  return {
    localStorageEnabled: settings.localStorageEnabled,
    storagePermissionAsked:
      typeof settings.storagePermissionAsked === 'boolean'
        ? settings.storagePermissionAsked
        : true,
  };
};

export const getSettings = async (): Promise<AppSettings> => {
  const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);

  if (!storedSettings) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(storedSettings);
    return parseSettings(parsed) ?? defaultSettings;
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = async (settings: AppSettings) => {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getExpenses = async (): Promise<Expense[]> => {
  const settings = await getSettings();

  if (!settings.localStorageEnabled) {
    return [];
  }

  const storedExpenses = await AsyncStorage.getItem(EXPENSES_KEY);

  if (!storedExpenses) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedExpenses);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isExpense);
  } catch {
    return [];
  }
};

export const saveExpenses = async (expenses: Expense[]) => {
  const settings = await getSettings();

  if (!settings.localStorageEnabled) {
    return;
  }

  await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

export const addExpense = async (expense: Expense) => {
  const expenses = await getExpenses();
  const nextExpenses = [expense, ...expenses];
  await saveExpenses(nextExpenses);
  return nextExpenses;
};

export const deleteExpense = async (expenseId: string) => {
  const expenses = await getExpenses();
  const nextExpenses = expenses.filter(expense => expense.id !== expenseId);
  await saveExpenses(nextExpenses);
  return nextExpenses;
};

export const getProfile = async (): Promise<UserProfile> => {
  const settings = await getSettings();

  if (!settings.localStorageEnabled) {
    return defaultProfile;
  }

  const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);

  if (!storedProfile) {
    return defaultProfile;
  }

  try {
    const parsed = JSON.parse(storedProfile);
    return isProfile(parsed) ? parsed : defaultProfile;
  } catch {
    return defaultProfile;
  }
};

export const saveProfile = async (profile: UserProfile) => {
  const settings = await getSettings();

  if (!settings.localStorageEnabled) {
    return;
  }

  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};
