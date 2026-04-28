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
};

export type AppSettings = {
  localStorageEnabled: boolean;
  storagePermissionAsked: boolean;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  AddExpense: undefined;
  AllExpenses: undefined;
  Profile: undefined;
};
