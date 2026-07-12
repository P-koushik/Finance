import type {
  Expense,
  Group,
  GroupExpense,
  GroupExpenseItem,
  SettlementPayment,
  SettlementSuggestion,
  SharedGroupCategory,
  SharedMember,
  SpendingCategoryAnalytics,
  SplitBalance,
  SplitExpense,
  SplitGroup,
  MonthlySpendingAnalytics,
  UserProfile,
  UserSearchResult,
} from '../types';
import { api } from '../lib/api';

type ApiEnvelope<T> = {
  message: string;
  data: T;
};

type WithMongoId<T> = T & {
  _id?: string;
  id?: string;
};

type MongoRef = string | { _id?: string; id?: string };
type PopulatedUserRef =
  | string
  | {
      _id?: string;
      id?: string;
      name?: string;
      email?: string;
      profilePicture?: string;
    };

const withId = <T extends { id: string }>(value: WithMongoId<T>): T => ({
  ...value,
  id: value.id ?? value._id ?? '',
});

const withIds = <T extends { id: string }>(values: Array<WithMongoId<T>>) =>
  values.map(withId);

const refId = (value: MongoRef) =>
  typeof value === 'string' ? value : (value.id ?? value._id ?? '');

const normalizeMember = (
  member: Omit<SharedMember, 'user'> & { user: PopulatedUserRef },
): SharedMember => {
  const populatedUser =
    typeof member.user === 'string' ? undefined : member.user;

  return {
    ...member,
    user: {
      id: refId(member.user),
      name: populatedUser?.name ?? '',
      email: populatedUser?.email,
      profilePicture: populatedUser?.profilePicture,
    },
  };
};

const normalizeGroup = (group: WithMongoId<Group>): Group => ({
  ...withId(group),
  owner: refId(group.owner as MongoRef),
  members: (group.members ?? []).map(member =>
    normalizeMember(member as unknown as Parameters<typeof normalizeMember>[0]),
  ),
});

const normalizeGroups = (groups: Array<WithMongoId<Group>>) =>
  groups.map(normalizeGroup);

const normalizeSplitGroup = (
  splitGroup: WithMongoId<SplitGroup>,
): SplitGroup => ({
  ...withId(splitGroup),
  owner: refId(splitGroup.owner as MongoRef),
  members: (splitGroup.members ?? []).map(member =>
    normalizeMember(member as unknown as Parameters<typeof normalizeMember>[0]),
  ),
});

const normalizeSplitGroups = (splitGroups: Array<WithMongoId<SplitGroup>>) =>
  splitGroups.map(normalizeSplitGroup);

type TransactionPayload = {
  title: string;
  amount: number;
  category: string;
  date: string;
};

type SharedGroupPayload = {
  name: string;
  description?: string;
  category: SharedGroupCategory;
  default_currency: string;
};

type SharedGroupUpdatePayload = Partial<SharedGroupPayload>;

type GroupExpensePayload = {
  title: string;
  amount: string | number;
  paid_by: string;
  date: string;
  category: string;
  notes?: string;
  items: GroupExpenseItem[];
};

type EqualSplitExpensePayload = {
  title: string;
  total_amount: string | number;
  paid_by: string;
  date: string;
  category: string;
  notes?: string;
  split_type: 'equal';
  participants: string[];
};

type UnequalSplitExpensePayload = {
  title: string;
  total_amount: string | number;
  paid_by: string;
  date: string;
  category: string;
  notes?: string;
  split_type: 'unequal';
  participants: Array<{
    user: string;
    share_amount: string | number;
  }>;
};

type PercentageSplitExpensePayload = {
  title: string;
  total_amount: string | number;
  paid_by: string;
  date: string;
  category: string;
  notes?: string;
  split_type: 'percentage';
  participants: Array<{
    user: string;
    percentage: string | number;
  }>;
};

type SplitExpensePayload =
  | EqualSplitExpensePayload
  | UnequalSplitExpensePayload
  | PercentageSplitExpensePayload;

type SettlementPaymentPayload = {
  paid_by: string;
  paid_to: string;
  amount: string | number;
  payment_date: string;
  method?: 'cash' | 'upi' | 'bank_transfer' | 'card' | 'wallet' | 'other';
  note?: string;
  client_request_id: string;
};

export type UpdateProfilePayload = Pick<UserProfile, 'name'> & {
  monthlyBudget: number;
  availableAmount: number;
  savingsAmount: number;
  monthlyCreditDay: number;
  income_date: string;
};

export const financeApi = {
  async signIn(idToken?: string) {
    const response = await api.post<ApiEnvelope<UserProfile>>(
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

    return response.data.data;
  },

  async getProfile() {
    const response = await api.get<ApiEnvelope<UserProfile>>('/user');

    return response.data.data;
  },

  async updateProfile(profile: UpdateProfilePayload) {
    const response = await api.put<ApiEnvelope<UserProfile>>('/user', profile);

    return response.data.data;
  },

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
      {
        params: {
          months,
          ...(endMonth ? { end_month: endMonth } : {}),
        },
      },
    );

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

  async searchUsers(email: string) {
    const response = await api.get<ApiEnvelope<UserSearchResult[]>>(
      '/user/search',
      {
        params: { email },
      },
    );

    return response.data.data;
  },

  async getGroups() {
    const response = await api.get<ApiEnvelope<Group[]>>('/groups');

    return normalizeGroups(response.data.data);
  },

  async createGroup(payload: SharedGroupPayload) {
    const response = await api.post<ApiEnvelope<Group>>('/groups', payload);

    return normalizeGroup(response.data.data);
  },

  async getGroup(groupId: string) {
    const response = await api.get<ApiEnvelope<Group>>(`/groups/${groupId}`);

    return normalizeGroup(response.data.data);
  },

  async updateGroup(groupId: string, payload: SharedGroupUpdatePayload) {
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

  async createGroupExpense(groupId: string, payload: GroupExpensePayload) {
    const response = await api.post<ApiEnvelope<GroupExpense>>(
      `/groups/${groupId}/expenses`,
      payload,
    );

    return withId(response.data.data);
  },

  async getSplitGroups() {
    const response = await api.get<ApiEnvelope<SplitGroup[]>>('/split-groups');

    return normalizeSplitGroups(response.data.data);
  },

  async createSplitGroup(payload: SharedGroupPayload) {
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
    payload: SharedGroupUpdatePayload,
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

  async createSplitExpense(splitGroupId: string, payload: SplitExpensePayload) {
    const response = await api.post<ApiEnvelope<SplitExpense>>(
      `/split-groups/${splitGroupId}/expenses`,
      payload,
    );

    return withId(response.data.data);
  },

  async getSplitBalances(splitGroupId: string) {
    const response = await api.get<ApiEnvelope<SplitBalance[]>>(
      `/split-groups/${splitGroupId}/balances`,
    );

    return response.data.data;
  },

  async getSettlementSuggestions(splitGroupId: string) {
    const response = await api.get<ApiEnvelope<SettlementSuggestion[]>>(
      `/split-groups/${splitGroupId}/settlement-suggestions`,
    );

    return response.data.data;
  },

  async getSettlementPayments(splitGroupId: string) {
    const response = await api.get<ApiEnvelope<SettlementPayment[]>>(
      `/split-groups/${splitGroupId}/payments`,
    );

    return response.data.data;
  },

  async createSettlementPayment(
    splitGroupId: string,
    payload: SettlementPaymentPayload,
  ) {
    const response = await api.post<ApiEnvelope<SettlementPayment>>(
      `/split-groups/${splitGroupId}/payments`,
      payload,
    );

    return response.data.data;
  },

  async confirmSettlementPayment(splitGroupId: string, paymentId: string) {
    const response = await api.post<ApiEnvelope<SettlementPayment>>(
      `/split-groups/${splitGroupId}/payments/${paymentId}/confirm`,
    );

    return response.data.data;
  },

  async rejectSettlementPayment(splitGroupId: string, paymentId: string) {
    const response = await api.post<ApiEnvelope<SettlementPayment>>(
      `/split-groups/${splitGroupId}/payments/${paymentId}/reject`,
    );

    return response.data.data;
  },
};

export const financeQueryKeys = {
  expenses: ['finance', 'expenses'] as const,
  expense: (expenseId: string) => ['finance', 'expense', expenseId] as const,
  group: (groupId: string) => ['finance', 'group', groupId] as const,
  groupExpenses: (groupId: string) =>
    ['finance', 'group-expenses', groupId] as const,
  groups: ['finance', 'groups'] as const,
  profile: ['finance', 'profile'] as const,
  spendingCategories: (month: string) =>
    ['finance', 'spending-categories', month] as const,
  spendingMonthly: (months: number, endMonth: string) =>
    ['finance', 'spending-monthly', months, endMonth] as const,
  settlementPayments: (splitGroupId: string) =>
    ['finance', 'settlement-payments', splitGroupId] as const,
  settlementSuggestions: (splitGroupId: string) =>
    ['finance', 'settlement-suggestions', splitGroupId] as const,
  splitBalances: (splitGroupId: string) =>
    ['finance', 'split-balances', splitGroupId] as const,
  splitExpenses: (splitGroupId: string) =>
    ['finance', 'split-expenses', splitGroupId] as const,
  splitGroup: (splitGroupId: string) =>
    ['finance', 'split-group', splitGroupId] as const,
  splitGroups: ['finance', 'split-groups'] as const,
};
