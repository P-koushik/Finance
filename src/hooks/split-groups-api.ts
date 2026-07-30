import type { SplitExpense, SplitGroup } from '../types';
import { api } from '../lib/api';
import {
  normalizeSplitGroup,
  normalizeSplitGroups,
  withId,
  withIds,
} from '../lib/finance-api-utils';
import type { ApiEnvelope } from '../lib/finance-api-utils';

export const splitGroupsApi = {
  async getSplitGroups() {
    const response = await api.get<ApiEnvelope<SplitGroup[]>>('/split-groups');
    return normalizeSplitGroups(response.data.data);
  },
  async createSplitGroup(
    payload: Pick<
      SplitGroup,
      'name' | 'description' | 'category' | 'default_currency'
    >,
  ) {
    const response = await api.post<ApiEnvelope<SplitGroup>>(
      '/split-groups',
      payload,
    );
    return normalizeSplitGroup(response.data.data);
  },
  async getSplitGroup(splitGroupId: string) {
    const response = await api.get<ApiEnvelope<SplitGroup>>(
      `/split-groups/${splitGroupId}`,
    );
    return normalizeSplitGroup(response.data.data);
  },
  async updateSplitGroup(
    splitGroupId: string,
    payload: Partial<
      Pick<SplitGroup, 'name' | 'description' | 'category' | 'default_currency'>
    >,
  ) {
    const response = await api.put<ApiEnvelope<SplitGroup>>(
      `/split-groups/${splitGroupId}`,
      payload,
    );
    return normalizeSplitGroup(response.data.data);
  },
  async deleteSplitGroup(splitGroupId: string) {
    await api.delete(`/split-groups/${splitGroupId}`);
  },
  async addSplitGroupMember(splitGroupId: string, userId: string) {
    const response = await api.post<ApiEnvelope<SplitGroup>>(
      `/split-groups/${splitGroupId}/members`,
      { user_id: userId },
    );
    return normalizeSplitGroup(response.data.data);
  },
  async removeSplitGroupMember(splitGroupId: string, userId: string) {
    const response = await api.delete<ApiEnvelope<SplitGroup>>(
      `/split-groups/${splitGroupId}/members/${userId}`,
    );
    return normalizeSplitGroup(response.data.data);
  },
  async getSplitExpenses(splitGroupId: string) {
    const response = await api.get<ApiEnvelope<SplitExpense[]>>(
      `/split-groups/${splitGroupId}/expenses`,
    );
    return withIds(response.data.data);
  },
  async createSplitExpense(
    splitGroupId: string,
    payload:
      | {
          title: string;
          total_amount: string | number;
          paid_by: string;
          date: string;
          category: string;
          notes?: string;
          split_type: 'equal';
          participants: string[];
        }
      | {
          title: string;
          total_amount: string | number;
          paid_by: string;
          date: string;
          category: string;
          notes?: string;
          split_type: 'unequal';
          participants: Array<{ user: string; share_amount: string | number }>;
        }
      | {
          title: string;
          total_amount: string | number;
          paid_by: string;
          date: string;
          category: string;
          notes?: string;
          split_type: 'percentage';
          participants: Array<{ user: string; percentage: string | number }>;
        },
  ) {
    const response = await api.post<ApiEnvelope<SplitExpense>>(
      `/split-groups/${splitGroupId}/expenses`,
      payload,
    );
    return withId(response.data.data);
  },
};
