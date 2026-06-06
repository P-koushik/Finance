import type { NavigatorScreenParams } from '@react-navigation/native';

export type ExpenseCategory = 'Food' | 'Travel' | 'Utilities' | 'Other';

export type Expense = {
  _id: string;
  title: string;
  amount: number;
  category?: string;
  date: Date;
  createdAt?: string;
  updatedAt?: string;
};

export type UserProfile = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  profilePicture?: string;
  monthly_income: number;
  balance: number;
  savings: number;
  savings_goal?: number;
  income_day: number;
  income_date?: string | null;
  last_income_credit_month: string | null;
};

export type SharedGroupCategory =
  | 'family'
  | 'friends'
  | 'household'
  | 'trip'
  | 'office'
  | 'other';

export type SharedMember = {
  user: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'removed';
  joined_at?: string;
  removed_at?: string | null;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  category: SharedGroupCategory;
  owner: string;
  members: SharedMember[];
  default_currency: string;
  archived: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type GroupExpenseItem = {
  title: string;
  amount: string;
  category?: string;
  quantity?: number;
  notes?: string;
};

export type GroupExpense = {
  id: string;
  group: string;
  created_by: string;
  paid_by: string;
  title: string;
  amount: string;
  currency: string;
  date: string;
  category: string;
  notes: string;
  items: GroupExpenseItem[];
  item_subtotal_amount: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SplitGroup = {
  id: string;
  name: string;
  description: string;
  category: SharedGroupCategory;
  owner: string;
  members: SharedMember[];
  default_currency: string;
  archived: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SplitParticipantShare = {
  user: string;
  share_amount: string;
  percentage?: string;
};

export type SplitExpense = {
  id: string;
  split_group: string;
  created_by: string;
  paid_by: string;
  title: string;
  total_amount: string;
  currency: string;
  date: string;
  category: string;
  split_type: 'equal' | 'unequal' | 'percentage';
  participants: SplitParticipantShare[];
  status: 'active' | 'cancelled';
  notes: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SplitBalance = {
  user: string;
  net_amount: string;
};

export type SettlementSuggestion = {
  paid_by: string;
  paid_to: string;
  amount: string;
};

export type SettlementPaymentAllocation = {
  split_expense: string;
  debtor: string;
  creditor: string;
  amount: string;
  allocation_type: 'direct' | 'netted_offset' | 'refund_adjustment';
};

export type SettlementPayment = {
  id: string;
  split_group: string;
  paid_by: string;
  paid_to: string;
  amount: string;
  currency: string;
  payment_date: string;
  method?: 'cash' | 'upi' | 'bank_transfer' | 'card' | 'wallet' | 'other';
  note: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  requested_by: string;
  confirmed_by?: string | null;
  confirmed_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  client_request_id: string;
  allocations: SettlementPaymentAllocation[];
  createdAt?: string;
  updatedAt?: string;
};

export type UserSearchResult = {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
};

export type RootTabParamList = {
  Home: undefined;
  AddExpense: undefined;
  Groups: undefined;
  SplitGroups: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainTabs: NavigatorScreenParams<RootTabParamList> | undefined;
  EditExpense: { expenseId: string };
  AllExpenses: undefined;
  GroupDetails: { groupId: string };
  CreateGroup: undefined;
  CreateGroupExpense: { groupId: string };
  SplitGroupDetails: { splitGroupId: string };
  CreateSplitGroup: undefined;
  CreateSplitExpense: { splitGroupId: string };
  SplitBalances: { splitGroupId: string };
};
