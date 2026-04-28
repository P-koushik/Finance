import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ShoppingCart, Trash2 } from 'lucide-react-native';

import type { Expense } from '../types';
import { formatCurrency, formatDateTime } from '../utils/format';

type ExpenseCardProps = {
  expense: Expense;
  onDelete: (expenseId: string) => void;
};

export function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <ShoppingCart color="#0d4976" size={25} strokeWidth={2.7} />
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {expense.title}
        </Text>
        <Text numberOfLines={1} style={styles.date}>
          {formatDateTime(expense.createdAt)}
        </Text>
      </View>

      <View style={styles.amountWrap}>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{expense.category ?? 'Other'}</Text>
        </View>
      </View>

      <Pressable
        accessibilityLabel={`Delete ${expense.title}`}
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => onDelete(expense.id)}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.pressed,
        ]}
      >
        <Trash2 color="#87909c" size={18} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  amount: {
    color: '#1d4d7c',
    fontSize: 15,
    fontWeight: '800',
  },
  amountWrap: {
    alignItems: 'flex-end',
    gap: 8,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    elevation: 2,
    flexDirection: 'row',
    gap: 14,
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#d1d7df',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.65,
    shadowRadius: 9,
  },
  content: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  date: {
    color: '#727984',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    marginRight: -6,
    width: 34,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: '#eef2f5',
    borderRadius: 27,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  pressed: {
    opacity: 0.55,
  },
  tag: {
    backgroundColor: '#d5f5e5',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: '#198260',
    fontSize: 9,
    fontWeight: '800',
  },
  title: {
    color: '#343b45',
    fontSize: 16,
    fontWeight: '800',
  },
});
