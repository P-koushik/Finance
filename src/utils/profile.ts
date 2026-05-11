import type { UserProfile } from '../types';

export const defaultProfile: UserProfile = {
  name: '',
  email: '',
  monthlyBudget: 0,
  availableAmount: 0,
  savingsAmount: 0,
  monthlyCreditDay: 1,
  lastMonthlyCreditMonth: null,
};
