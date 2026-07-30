import type { Group, GroupExpense } from '../types';
import { api } from '../lib/api';
import {
  normalizeGroup,
  normalizeGroups,
  withId,
  withIds,
} from '../lib/finance-api-utils';
import type { ApiEnvelope } from '../lib/finance-api-utils';

export const groupsApi = {
  async getGroups() {
    const response = await api.get<ApiEnvelope<Group[]>>('/groups');
    return normalizeGroups(response.data.data);
  },
  async createGroup(
    payload: Pick<
      Group,
      'name' | 'description' | 'category' | 'default_currency'
    >,
  ) {
    const response = await api.post<ApiEnvelope<Group>>('/groups', payload);
    return normalizeGroup(response.data.data);
  },
  async getGroup(groupId: string) {
    const response = await api.get<ApiEnvelope<Group>>(`/groups/${groupId}`);
    return normalizeGroup(response.data.data);
  },
  async updateGroup(
    groupId: string,
    payload: Partial<
      Pick<Group, 'name' | 'description' | 'category' | 'default_currency'>
    >,
  ) {
    const response = await api.put<ApiEnvelope<Group>>(
      `/groups/${groupId}`,
      payload,
    );
    return normalizeGroup(response.data.data);
  },
  async deleteGroup(groupId: string) {
    await api.delete(`/groups/${groupId}`);
  },
  async addGroupMember(groupId: string, userId: string) {
    const response = await api.post<ApiEnvelope<Group>>(
      `/groups/${groupId}/members`,
      { user_id: userId },
    );
    return normalizeGroup(response.data.data);
  },
  async removeGroupMember(groupId: string, userId: string) {
    const response = await api.delete<ApiEnvelope<Group>>(
      `/groups/${groupId}/members/${userId}`,
    );
    return normalizeGroup(response.data.data);
  },
  async getGroupExpenses(groupId: string) {
    const response = await api.get<ApiEnvelope<GroupExpense[]>>(
      `/groups/${groupId}/expenses`,
    );
    return withIds(response.data.data);
  },
  async createGroupExpense(
    groupId: string,
    payload: Pick<
      GroupExpense,
      'title' | 'paid_by' | 'date' | 'category' | 'notes' | 'items'
    > & {
      amount: string | number;
    },
  ) {
    const response = await api.post<ApiEnvelope<GroupExpense>>(
      `/groups/${groupId}/expenses`,
      payload,
    );
    return withId(response.data.data);
  },
};
