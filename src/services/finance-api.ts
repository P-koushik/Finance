import type { Expense, UserProfile } from '../types';
import { api } from '../lib/api';

type ApiEnvelope<T> = {
  message: string;
  data: T;
};

type BackendUser = UserProfile & {
  id: string;
};

type TransactionPayload = {
  title: string;
  amount: number;
  category: string;
  date: string;
};

const normalizeProfile = (user: BackendUser): UserProfile => ({
  name: user.name ?? '',
  email: user.email ?? '',
  monthlyBudget: user.monthlyBudget ?? 0,
  availableAmount: user.availableAmount ?? 0,
  savingsAmount: user.savingsAmount ?? 0,
  monthlyCreditDay: user.monthlyCreditDay ?? 1,
  lastMonthlyCreditMonth: user.lastMonthlyCreditMonth ?? null,
});

export const financeApi = {
  async signIn(idToken?: string) {
    const response = await api.post<ApiEnvelope<BackendUser>>(
      '/user/signin',
      undefined,
      idToken
        ? {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        : undefined,
    );

    return normalizeProfile(response.data.data);
  },

  async getProfile() {
    const response = await api.get<ApiEnvelope<BackendUser>>('/user');

    return normalizeProfile(response.data.data);
  },

  async updateProfile(
    profile: Pick<UserProfile, 'monthlyBudget' | 'monthlyCreditDay'>,
  ) {
    const response = await api.put<ApiEnvelope<BackendUser>>('/user', profile);

    return normalizeProfile(response.data.data);
  },

  async getExpenses() {
    const response = await api.get<ApiEnvelope<Expense[]>>('/transactions');

    return response.data.data;
  },

  async getExpense(expenseId: string) {
    const response = await api.get<ApiEnvelope<Expense>>(
      `/transactions/${expenseId}`,
    );

    return response.data.data;
  },

  async createExpense(payload: TransactionPayload) {
    const response = await api.post<ApiEnvelope<Expense>>(
      '/transactions',
      payload,
    );

    return response.data.data;
  },

  async updateExpense(expenseId: string, payload: TransactionPayload) {
    const response = await api.put<ApiEnvelope<Expense>>(
      `/transactions/${expenseId}`,
      payload,
    );

    return response.data.data;
  },

  async deleteExpense(expenseId: string) {
    await api.delete(`/transactions/${expenseId}`);
  },

  async addToSavings(amount: number) {
    const response = await api.post<ApiEnvelope<BackendUser>>(
      '/transactions/add-to-savings',
      { amount },
    );

    return normalizeProfile(response.data.data);
  },

  async withdrawFromSavings(amount: number) {
    const response = await api.post<ApiEnvelope<BackendUser>>(
      '/transactions/withdraw-from-savings',
      { amount },
    );

    return normalizeProfile(response.data.data);
  },
};

export const financeQueryKeys = {
  expenses: ['finance', 'expenses'] as const,
  expense: (expenseId: string) => ['finance', 'expense', expenseId] as const,
  profile: ['finance', 'profile'] as const,
};
