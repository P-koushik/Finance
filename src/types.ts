export type ExpenseCategory = 'Food' | 'Travel' | 'Utilities' | 'Other';

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category?: string;
  createdAt: string;
};

export type UserProfile = {
  name: string;
  email: string;
  monthlyBudget: number;
  availableAmount: number;
  savingsAmount: number;
  monthlyCreditDay: number;
  lastMonthlyCreditMonth: string | null;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  AddExpense: undefined;
  Savings: undefined;
  EditExpense: { expenseId: string };
  AllExpenses: undefined;
  Profile: undefined;
};
