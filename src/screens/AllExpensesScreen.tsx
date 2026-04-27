import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {ChevronLeft, WalletCards} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ConfirmCard} from '../components/ConfirmCard';
import {ExpenseCard} from '../components/ExpenseCard';
import {useToast} from '../components/ToastProvider';
import type {Expense} from '../types';
import {deleteExpense, getExpenses} from '../utils/storage';

export function AllExpensesScreen() {
  const navigation = useNavigation();
  const {showToast} = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    try {
      const storedExpenses = await getExpenses();
      setExpenses(storedExpenses);
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
          <Pressable
            accessibilityLabel="Back to home"
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <ChevronLeft color="#475569" size={26} strokeWidth={2.6} />
          </Pressable>
          <View style={styles.brand}>
            <WalletCards color="#2e62dd" size={24} strokeWidth={2.7} />
            <Text style={styles.brandText}>All Transactions</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color="#124777" />
            </View>
          ) : expenses.length ? (
            <View style={styles.list}>
              {expenses.map(expense => (
                <ExpenseCard
                  expense={expense}
                  key={expense.id}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No transactions</Text>
              <Text style={styles.emptyText}>
                Saved expenses will appear here.
              </Text>
            </View>
          )}
        </ScrollView>
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
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
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
  centerState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  content: {
    padding: 22,
    paddingBottom: 40,
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
    gap: 8,
    height: 64,
    paddingHorizontal: 14,
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
});
