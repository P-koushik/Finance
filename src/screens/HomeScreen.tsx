import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NavigationProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  TrendingUp,
  WalletCards,
} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {BottomBar} from '../components/BottomBar';
import {ConfirmCard} from '../components/ConfirmCard';
import {ExpenseCard} from '../components/ExpenseCard';
import {useToast} from '../components/ToastProvider';
import type {Expense, RootStackParamList, UserProfile} from '../types';
import {formatCurrency} from '../utils/format';
import {
  defaultProfile,
  deleteExpense,
  getExpenses,
  getProfile,
} from '../utils/storage';

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {showToast} = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const totalSpent = useMemo(
    () => expenses.reduce((total, expense) => total + expense.amount, 0),
    [expenses],
  );

  const topCategory = useMemo(() => {
    if (!expenses.length) {
      return 'None';
    }

    const totals = expenses.reduce<Record<string, number>>((acc, expense) => {
      const category = expense.category ?? 'Other';
      acc[category] = (acc[category] ?? 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
  }, [expenses]);

  const monthlyBudget = profile.monthlyBudget;
  const remaining = Math.max(monthlyBudget - totalSpent, 0);
  const visibleExpenses = expenses.slice(0, 10);

  const loadExpenses = useCallback(async () => {
    try {
      const [storedExpenses, storedProfile] = await Promise.all([
        getExpenses(),
        getProfile(),
      ]);
      setExpenses(storedExpenses);
      setProfile(storedProfile);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses]),
  );

  const handleDelete = (expenseId: string) => {
    setExpenseToDelete(expenseId);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) {
      return;
    }

    const nextExpenses = await deleteExpense(expenseToDelete);
    setExpenses(nextExpenses);
    setExpenseToDelete(null);
    showToast({
      type: 'success',
      title: 'Expense deleted',
      message: 'The transaction was removed from your tracker.',
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <WalletCards color="#2e62dd" size={24} strokeWidth={2.7} />
            <Text style={styles.brandText}>Finance</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Spent</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalSpent)}</Text>
            <View style={styles.budgetRow}>
              <View style={styles.trendIcon}>
                <TrendingUp color="#ffffff" size={24} strokeWidth={2.7} />
              </View>
              <View style={styles.budgetTextGroup}>
                <Text style={styles.budgetLabel}>Monthly Budget</Text>
                <Text style={styles.budgetValue}>
                  {formatCurrency(monthlyBudget)}
                </Text>
              </View>
              <View style={styles.budgetTextGroup}>
                <Text style={styles.budgetLabel}>Remaining</Text>
                <Text style={styles.budgetValue}>
                  {formatCurrency(remaining)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Top Category</Text>
              <Text style={styles.statValue}>{topCategory}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Daily Avg</Text>
              <Text style={styles.statValue}>
                {formatCurrency(expenses.length ? totalSpent / 30 : 0)}
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            {expenses.length > 10 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('AllExpenses')}
                hitSlop={8}>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            ) : null}
          </View>

          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color="#124777" />
            </View>
          ) : expenses.length ? (
            <View style={styles.list}>
              {visibleExpenses.map(expense => (
                <ExpenseCard
                  expense={expense}
                  key={expense.id}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No expenses yet</Text>
              <Text style={styles.emptyText}>
                Add your first expense to start tracking total spending.
              </Text>
            </View>
          )}
        </ScrollView>

        <BottomBar active="home" />
        <ConfirmCard
          confirmLabel="Delete"
          message="Remove this expense from your tracker?"
          onCancel={() => setExpenseToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete expense"
          visible={Boolean(expenseToDelete)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  brandText: {
    color: '#2b5fd7',
    fontSize: 20,
    fontWeight: '800',
  },
  budgetLabel: {
    color: '#a8bdd9',
    fontSize: 14,
    fontWeight: '700',
  },
  budgetRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 14,
    marginTop: 28,
    padding: 16,
  },
  budgetTextGroup: {
    flex: 1,
    gap: 5,
  },
  budgetValue: {
    color: '#e8f0fb',
    fontSize: 14,
    fontWeight: '800',
  },
  centerState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  content: {
    padding: 22,
    paddingBottom: 112,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 28,
  },
  emptyText: {
    color: '#7a828d',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#343b45',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 22,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendText: {
    color: '#5f6873',
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    gap: 14,
  },
  safeArea: {
    backgroundColor: '#f4f8fb',
    flex: 1,
  },
  screen: {
    backgroundColor: '#f4f8fb',
    flex: 1,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 26,
  },
  sectionTitle: {
    color: '#666e78',
    fontSize: 16,
    fontWeight: '800',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    elevation: 2,
    flex: 1,
    gap: 8,
    minHeight: 78,
    padding: 18,
    shadowColor: '#d3d8df',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.62,
    shadowRadius: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 24,
  },
  statTitle: {
    color: '#6c7480',
    fontSize: 14,
    fontWeight: '700',
  },
  statValue: {
    color: '#2c5c8d',
    fontSize: 16,
    fontWeight: '800',
  },
  totalCard: {
    backgroundColor: '#2e5f95',
    borderRadius: 28,
    padding: 24,
  },
  totalLabel: {
    color: '#9db6d8',
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '400',
    marginTop: 14,
  },
  trendIcon: {
    alignItems: 'center',
    backgroundColor: '#69bdc1',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  viewAll: {
    color: '#088b84',
    fontSize: 15,
    fontWeight: '800',
  },
});
