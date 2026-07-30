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
