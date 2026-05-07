import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Expense } from '../src/types';
import {
  addExpense,
  applyMonthlyCreditIfDue,
  deleteExpense,
  defaultProfile,
  getExpenses,
  getProfile,
  moveAvailableToSavings,
  saveExpenses,
  saveProfile,
  updateExpense,
  withdrawSavingsToAvailable,
} from '../src/utils/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  (() => {
    let store: Record<string, string> = {};

    return {
      clear: jest.fn(() => {
        store = {};
        return Promise.resolve();
      }),
      getItem: jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
      removeItem: jest.fn((key: string) => {
        delete store[key];
        return Promise.resolve();
      }),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
        return Promise.resolve();
      }),
    };
  })(),
);

const expense: Expense = {
  id: 'expense-1',
  title: 'Groceries',
  amount: 1450,
  createdAt: '2026-04-28T10:00:00.000Z',
};

beforeEach(() => {
  AsyncStorage.clear();
});

test('returns an empty array when storage is empty', async () => {
  await expect(getExpenses()).resolves.toEqual([]);
});

test('handles invalid storage safely', async () => {
  await AsyncStorage.setItem('expenses', 'not-json');

  await expect(getExpenses()).resolves.toEqual([]);
});

test('saves and loads expenses', async () => {
  await saveExpenses([expense]);

  await expect(getExpenses()).resolves.toEqual([expense]);
});

test('adds a new expense before existing expenses', async () => {
  const secondExpense: Expense = {
    id: 'expense-2',
    title: 'Coffee',
    amount: 320,
    createdAt: '2026-04-28T11:00:00.000Z',
  };

  await saveExpenses([expense]);
  await addExpense(secondExpense);

  await expect(getExpenses()).resolves.toEqual([secondExpense, expense]);
});

test('deletes the matching expense', async () => {
  const secondExpense: Expense = {
    id: 'expense-2',
    title: 'Coffee',
    amount: 320,
    createdAt: '2026-04-28T11:00:00.000Z',
  };

  await saveExpenses([expense, secondExpense]);
  await deleteExpense('expense-1');

  await expect(getExpenses()).resolves.toEqual([secondExpense]);
});

test('updates the matching expense without changing list order', async () => {
  const secondExpense: Expense = {
    id: 'expense-2',
    title: 'Coffee',
    amount: 320,
    category: 'Food',
    createdAt: '2026-04-28T11:00:00.000Z',
  };
  const updatedExpense: Expense = {
    ...expense,
    amount: 1600,
    category: 'Utilities',
    title: 'Groceries and supplies',
  };

  await saveExpenses([expense, secondExpense]);

  await expect(updateExpense(updatedExpense)).resolves.toEqual([
    updatedExpense,
    secondExpense,
  ]);
  await expect(getExpenses()).resolves.toEqual([updatedExpense, secondExpense]);
});

test('does not persist when updating a missing expense', async () => {
  const missingExpense: Expense = {
    id: 'missing-expense',
    title: 'Missing',
    amount: 999,
    createdAt: '2026-04-29T10:00:00.000Z',
  };

  await saveExpenses([expense]);

  await expect(updateExpense(missingExpense)).resolves.toBeNull();
  await expect(getExpenses()).resolves.toEqual([expense]);
});

test('returns the default profile when profile storage is empty', async () => {
  await expect(getProfile()).resolves.toEqual(defaultProfile);
});

test('does not seed hardcoded money for new profiles', async () => {
  await expect(getProfile()).resolves.toEqual({
    name: '',
    email: '',
    monthlyBudget: 0,
    availableAmount: 0,
    savingsAmount: 0,
    monthlyCreditDay: 1,
    lastMonthlyCreditMonth: null,
  });
});

test('saves and loads savings balance with profile', async () => {
  const profile = {
    name: 'Koushik',
    email: 'koushik@example.com',
    monthlyBudget: 60000,
    availableAmount: 25000,
    savingsAmount: 12000,
    monthlyCreditDay: 7,
    lastMonthlyCreditMonth: null,
  };

  await saveProfile(profile);

  await expect(getProfile()).resolves.toEqual(profile);
});

test('adds zero savings for older saved profiles', async () => {
  await AsyncStorage.setItem(
    'profile',
    JSON.stringify({
      name: 'Koushik',
      email: 'koushik@example.com',
      monthlyBudget: 50000,
    }),
  );

  await expect(getProfile()).resolves.toEqual({
    name: 'Koushik',
    email: 'koushik@example.com',
    monthlyBudget: 50000,
    availableAmount: 0,
    savingsAmount: 0,
    monthlyCreditDay: 1,
    lastMonthlyCreditMonth: null,
  });
});

test('adds the monthly amount to available money when a new month is due', async () => {
  const profile = {
    name: 'Koushik',
    email: 'koushik@example.com',
    monthlyBudget: 10000,
    availableAmount: 5000,
    savingsAmount: 5000,
    monthlyCreditDay: 1,
    lastMonthlyCreditMonth: '2026-04',
  };

  const creditedProfile = await applyMonthlyCreditIfDue(
    profile,
    new Date('2026-05-07T10:00:00.000Z'),
  );

  expect(creditedProfile).toEqual({
    ...profile,
    availableAmount: 15000,
    lastMonthlyCreditMonth: '2026-05',
  });
  await expect(getProfile()).resolves.toEqual(creditedProfile);
});

test('does not add the monthly amount twice in the same month', async () => {
  const profile = {
    name: 'Koushik',
    email: 'koushik@example.com',
    monthlyBudget: 10000,
    availableAmount: 15000,
    savingsAmount: 15000,
    monthlyCreditDay: 1,
    lastMonthlyCreditMonth: '2026-05',
  };

  await expect(
    applyMonthlyCreditIfDue(profile, new Date('2026-05-20T10:00:00.000Z')),
  ).resolves.toEqual(profile);
});

test('catches up missed monthly credits', async () => {
  const profile = {
    name: 'Koushik',
    email: 'koushik@example.com',
    monthlyBudget: 10000,
    availableAmount: 5000,
    savingsAmount: 5000,
    monthlyCreditDay: 1,
    lastMonthlyCreditMonth: '2026-03',
  };

  await expect(
    applyMonthlyCreditIfDue(profile, new Date('2026-05-07T10:00:00.000Z')),
  ).resolves.toEqual({
    ...profile,
    availableAmount: 25000,
    lastMonthlyCreditMonth: '2026-05',
  });
});

test('waits until the selected monthly credit day', async () => {
  const profile = {
    name: 'Koushik',
    email: 'koushik@example.com',
    monthlyBudget: 10000,
    availableAmount: 5000,
    savingsAmount: 5000,
    monthlyCreditDay: 15,
    lastMonthlyCreditMonth: '2026-04',
  };

  await expect(
    applyMonthlyCreditIfDue(profile, new Date('2026-05-07T10:00:00.000Z')),
  ).resolves.toEqual(profile);

  await expect(
    applyMonthlyCreditIfDue(profile, new Date('2026-05-15T10:00:00.000Z')),
  ).resolves.toEqual({
    ...profile,
    availableAmount: 15000,
    lastMonthlyCreditMonth: '2026-05',
  });
});

test('credits the previous missed month before the current selected day', async () => {
  const profile = {
    name: 'Koushik',
    email: 'koushik@example.com',
    monthlyBudget: 10000,
    availableAmount: 5000,
    savingsAmount: 5000,
    monthlyCreditDay: 15,
    lastMonthlyCreditMonth: '2026-03',
  };

  await expect(
    applyMonthlyCreditIfDue(profile, new Date('2026-05-07T10:00:00.000Z')),
  ).resolves.toEqual({
    ...profile,
    availableAmount: 15000,
    lastMonthlyCreditMonth: '2026-04',
  });
});

test('moves available money into savings', async () => {
  const profile = {
    name: 'Koushik',
    email: 'koushik@example.com',
    monthlyBudget: 10000,
    availableAmount: 10000,
    savingsAmount: 2000,
    monthlyCreditDay: 1,
    lastMonthlyCreditMonth: '2026-05',
  };

  const nextProfile = await moveAvailableToSavings(profile, 5000, 3000);

  expect(nextProfile).toEqual({
    ...profile,
    availableAmount: 5000,
    savingsAmount: 7000,
  });
  await expect(getProfile()).resolves.toEqual(nextProfile);
});

test('blocks savings transfer above displayed available money', async () => {
  const profile = {
    name: 'Koushik',
    email: 'koushik@example.com',
    monthlyBudget: 10000,
    availableAmount: 10000,
    savingsAmount: 2000,
    monthlyCreditDay: 1,
    lastMonthlyCreditMonth: '2026-05',
  };

  await expect(moveAvailableToSavings(profile, 8000, 3000)).resolves.toBeNull();
  await expect(getProfile()).resolves.toEqual(defaultProfile);
});

test('does not count savings as available money for transfers', async () => {
  const profile = {
    name: 'Koushik',
    email: 'koushik@example.com',
    monthlyBudget: 10000,
    availableAmount: 1000,
    savingsAmount: 50000,
    monthlyCreditDay: 1,
    lastMonthlyCreditMonth: '2026-05',
  };

  await expect(moveAvailableToSavings(profile, 2000)).resolves.toBeNull();
});

test('withdraws savings into available money', async () => {
  const profile = {
    name: 'Koushik',
    email: 'koushik@example.com',
    monthlyBudget: 10000,
    availableAmount: 4000,
    savingsAmount: 6000,
    monthlyCreditDay: 1,
    lastMonthlyCreditMonth: '2026-05',
  };

  const nextProfile = await withdrawSavingsToAvailable(profile, 2500);

  expect(nextProfile).toEqual({
    ...profile,
    availableAmount: 6500,
    savingsAmount: 3500,
  });
  await expect(getProfile()).resolves.toEqual(nextProfile);
});

test('blocks savings withdrawal above saved amount', async () => {
  const profile = {
    name: 'Koushik',
    email: 'koushik@example.com',
    monthlyBudget: 10000,
    availableAmount: 4000,
    savingsAmount: 6000,
    monthlyCreditDay: 1,
    lastMonthlyCreditMonth: '2026-05',
  };

  await expect(withdrawSavingsToAvailable(profile, 7000)).resolves.toBeNull();
  await expect(getProfile()).resolves.toEqual(defaultProfile);
});
