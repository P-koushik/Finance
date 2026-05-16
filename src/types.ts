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
  name: string;
  email: string;
  monthlyBudget: number;
  availableAmount: number;
  savingsAmount: number;
  monthlyCreditDay: number;
  incomeDate: string | null;
  lastMonthlyCreditMonth: string | null;
};

export type RootTabParamList = {
  Home: undefined;
  AddExpense: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainTabs: NavigatorScreenParams<RootTabParamList> | undefined;
  EditExpense: { expenseId: string };
  AllExpenses: undefined;
};
