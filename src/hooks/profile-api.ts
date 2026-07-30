import type { UserProfile, UserSearchResult } from '../types';
import { api } from '../lib/api';
import type { ApiEnvelope } from '../lib/finance-api-utils';

export const profileApi = {
  async signIn(idToken?: string) {
    const response = await api.post<ApiEnvelope<UserProfile>>(
      '/user/signin',
      undefined,
      idToken ? { headers: { Authorization: `Bearer ${idToken}` } } : undefined,
    );
    return response.data.data;
  },

  async getProfile() {
    const response = await api.get<ApiEnvelope<UserProfile>>('/user');
    return response.data.data;
  },

  async updateProfile(
    profile: Pick<UserProfile, 'name'> & {
      monthlyBudget: number;
      availableAmount: number;
      savingsAmount: number;
      monthlyCreditDay: number;
      income_date: string;
    },
  ) {
    const response = await api.put<ApiEnvelope<UserProfile>>('/user', profile);
    return response.data.data;
  },

  async searchUsers(email: string) {
    const response = await api.get<ApiEnvelope<UserSearchResult[]>>(
      '/user/search',
      {
        params: { email },
      },
    );
    return response.data.data;
  },
};
