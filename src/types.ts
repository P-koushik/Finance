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
