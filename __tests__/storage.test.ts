import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Expense } from '../src/types';
import {
  addExpense,
  deleteExpense,
  getSettings,
  getExpenses,
  saveSettings,
  saveExpenses,
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
  await saveSettings({
    localStorageEnabled: true,
    storagePermissionAsked: true,
  });
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

  await saveSettings({
    localStorageEnabled: true,
    storagePermissionAsked: true,
  });
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

  await saveSettings({
    localStorageEnabled: true,
    storagePermissionAsked: true,
  });
  await saveExpenses([expense, secondExpense]);
  await deleteExpense('expense-1');

  await expect(getExpenses()).resolves.toEqual([secondExpense]);
});

test('defaults local storage setting to disabled until permission is asked', async () => {
  await expect(getSettings()).resolves.toEqual({
    localStorageEnabled: false,
    storagePermissionAsked: false,
  });
});

test('does not read or save expenses when local storage is disabled', async () => {
  await saveSettings({
    localStorageEnabled: true,
    storagePermissionAsked: true,
  });
  await saveExpenses([expense]);
  await saveSettings({
    localStorageEnabled: false,
    storagePermissionAsked: true,
  });
  await addExpense({
    id: 'expense-2',
    title: 'Coffee',
    amount: 320,
    createdAt: '2026-04-28T11:00:00.000Z',
  });

  await expect(getExpenses()).resolves.toEqual([]);

  await saveSettings({
    localStorageEnabled: true,
    storagePermissionAsked: true,
  });
  await expect(getExpenses()).resolves.toEqual([expense]);
});
