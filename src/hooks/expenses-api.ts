import type {
  Expense,
  MonthlySpendingAnalytics,
  SpendingCategoryAnalytics,
  UserProfile,
} from '../types';
import { api } from '../lib/api';
import type { ApiEnvelope } from '../lib/finance-api-utils';

export const expensesApi = {
  async getExpenses() {
    const response = await api.get<ApiEnvelope<Expense[]>>('/transactions');
    return response.data.data;
  },
  async getSpendingByCategory(month?: string) {
    const response = await api.get<ApiEnvelope<SpendingCategoryAnalytics>>(
      '/transactions/analytics/categories',
      { params: month ? { month } : undefined },
    );
    return response.data.data;
  },
  async getMonthlySpending(months = 6, endMonth?: string) {
    const response = await api.get<ApiEnvelope<MonthlySpendingAnalytics>>(
      '/transactions/analytics/monthly',
      { params: { months, ...(endMonth ? { end_month: endMonth } : {}) } },
    );
    return response.data.data;
  },
  async getExpense(expenseId: string) {
    const response = await api.get<ApiEnvelope<Expense>>(
      `/transactions/${expenseId}`,
    );
    return response.data.data;
  },
  async createExpense(
    payload: Pick<Expense, 'title' | 'amount' | 'category'> & { date: string },
  ) {
    const response = await api.post<ApiEnvelope<Expense>>(
      '/transactions',
      payload,
    );
    return response.data.data;
  },
  async updateExpense(
    expenseId: string,
    payload: Pick<Expense, 'title' | 'amount' | 'category'> & { date: string },
  ) {
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
    const response = await api.post<ApiEnvelope<UserProfile>>(
      '/transactions/add-to-savings',
      { amount },
    );
    return response.data.data;
  },
  async withdrawFromSavings(amount: number) {
    const response = await api.post<ApiEnvelope<UserProfile>>(
      '/transactions/withdraw-from-savings',
      { amount },
    );
    return response.data.data;
  },
};
