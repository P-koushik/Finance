import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Expense, UserProfile } from '../types';

const EXPENSES_KEY = 'expenses';
const PROFILE_KEY = 'profile';
const DEFAULT_MONTHLY_CREDIT_DAY = 1;

export const defaultProfile: UserProfile = {
  name: '',
  email: '',
  monthlyBudget: 0,
  availableAmount: 0,
  savingsAmount: 0,
  monthlyCreditDay: DEFAULT_MONTHLY_CREDIT_DAY,
  lastMonthlyCreditMonth: null,
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

const normalizeProfile = (value: unknown): UserProfile | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const profile = value as Partial<UserProfile>;

  if (
    typeof profile.name !== 'string' ||
    typeof profile.email !== 'string' ||
    typeof profile.monthlyBudget !== 'number'
  ) {
    return null;
  }

  return {
    name: profile.name,
    email: profile.email,
    monthlyBudget: profile.monthlyBudget,
    availableAmount:
      typeof profile.availableAmount === 'number' ? profile.availableAmount : 0,
    savingsAmount:
      typeof profile.savingsAmount === 'number' ? profile.savingsAmount : 0,
    monthlyCreditDay:
      typeof profile.monthlyCreditDay === 'number'
        ? Math.min(Math.max(Math.trunc(profile.monthlyCreditDay), 1), 31)
        : DEFAULT_MONTHLY_CREDIT_DAY,
    lastMonthlyCreditMonth:
      typeof profile.lastMonthlyCreditMonth === 'string'
        ? profile.lastMonthlyCreditMonth
        : null,
  };
};

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const getMonthIndex = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);

  if (!year || !month || month < 1 || month > 12) {
    return null;
  }

  return year * 12 + month - 1;
};

const getMonthKeyFromIndex = (monthIndex: number) => {
  const year = Math.floor(monthIndex / 12);
  const month = (monthIndex % 12) + 1;

  return `${year}-${String(month).padStart(2, '0')}`;
};

const getDaysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate();

const getEffectiveCreditDay = (profile: UserProfile, date: Date) =>
  Math.min(
    profile.monthlyCreditDay,
    getDaysInMonth(date.getFullYear(), date.getMonth()),
  );

const getCreditMonthCount = (profile: UserProfile, date: Date) => {
  if (profile.monthlyBudget <= 0) {
    return 0;
  }

  const currentMonthKey = getMonthKey(date);
  const currentMonthIndex = getMonthIndex(currentMonthKey);

  if (currentMonthIndex === null) {
    return 0;
  }

  const effectiveCreditDay = getEffectiveCreditDay(profile, date);

  if (!profile.lastMonthlyCreditMonth) {
    return date.getDate() >= effectiveCreditDay ? 1 : 0;
  }

  const lastCreditMonthIndex = getMonthIndex(profile.lastMonthlyCreditMonth);

  if (lastCreditMonthIndex === null) {
    return date.getDate() >= effectiveCreditDay ? 1 : 0;
  }

  const latestDueMonthIndex =
    date.getDate() >= effectiveCreditDay
      ? currentMonthIndex
      : currentMonthIndex - 1;

  return Math.max(latestDueMonthIndex - lastCreditMonthIndex, 0);
};

const getLatestDueMonthKey = (profile: UserProfile, date: Date) => {
  const currentMonthKey = getMonthKey(date);
  const currentMonthIndex = getMonthIndex(currentMonthKey);

  if (currentMonthIndex === null) {
    return currentMonthKey;
  }

  const effectiveCreditDay = getEffectiveCreditDay(profile, date);
  const latestDueMonthIndex =
    date.getDate() >= effectiveCreditDay
      ? currentMonthIndex
      : currentMonthIndex - 1;

  return getMonthKeyFromIndex(latestDueMonthIndex);
};

export const getExpenses = async (): Promise<Expense[]> => {
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

export const updateExpense = async (updatedExpense: Expense) => {
  const expenses = await getExpenses();
  let expenseFound = false;
  const nextExpenses = expenses.map(expense => {
    if (expense.id !== updatedExpense.id) {
      return expense;
    }

    expenseFound = true;
    return updatedExpense;
  });

  if (!expenseFound) {
    return null;
  }

  await saveExpenses(nextExpenses);
  return nextExpenses;
};

export const getProfile = async (): Promise<UserProfile> => {
  const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);

  if (!storedProfile) {
    return defaultProfile;
  }

  try {
    const parsed = JSON.parse(storedProfile);
    return normalizeProfile(parsed) ?? defaultProfile;
  } catch {
    return defaultProfile;
  }
};

export const saveProfile = async (profile: UserProfile) => {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const applyMonthlyCreditIfDue = async (
  profile: UserProfile,
  date = new Date(),
) => {
  const creditMonthCount = getCreditMonthCount(profile, date);

  if (!creditMonthCount) {
    return profile;
  }

  const nextProfile = {
    ...profile,
    lastMonthlyCreditMonth: getLatestDueMonthKey(profile, date),
    availableAmount:
      profile.availableAmount + profile.monthlyBudget * creditMonthCount,
  };

  await saveProfile(nextProfile);
  return nextProfile;
};

export const moveAvailableToSavings = async (
  profile: UserProfile,
  amount: number,
  spentAmount = 0,
) => {
  const availableToMove = Math.max(profile.availableAmount - spentAmount, 0);

  if (!Number.isFinite(amount) || amount <= 0 || amount > availableToMove) {
    return null;
  }

  const nextProfile = {
    ...profile,
    availableAmount: profile.availableAmount - amount,
    savingsAmount: profile.savingsAmount + amount,
  };

  await saveProfile(nextProfile);
  return nextProfile;
};

export const withdrawSavingsToAvailable = async (
  profile: UserProfile,
  amount: number,
) => {
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > profile.savingsAmount
  ) {
    return null;
  }

  const nextProfile = {
    ...profile,
    availableAmount: profile.availableAmount + amount,
    savingsAmount: profile.savingsAmount - amount,
  };

  await saveProfile(nextProfile);
  return nextProfile;
};
