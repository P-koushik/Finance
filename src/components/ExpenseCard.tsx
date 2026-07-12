import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ShoppingCart, Trash2 } from 'lucide-react-native';

import type { Expense } from '../types';
import { appTheme } from '../styles/theme';
import { formatCurrency, formatDateTime } from '../utils/format';

type ExpenseCardProps = {
  expense: Expense;
  onDelete: (expenseId: string) => void;
  onPress?: (expense: Expense) => void;
};

export function ExpenseCard({ expense, onDelete, onPress }: ExpenseCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <ShoppingCart color={appTheme.green} size={23} strokeWidth={2.7} />
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {expense.title}
        </Text>
        <Text numberOfLines={1} style={styles.date}>
          {formatDateTime(expense.date)}
        </Text>
      </View>

      <View style={styles.amountWrap}>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{expense.category ?? 'Other'}</Text>
        </View>
      </View>

      {onPress ? (
        <Pressable
          accessibilityLabel={`Edit ${expense.title}`}
          accessibilityRole="button"
          onPress={() => onPress(expense)}
          style={styles.editHitArea}
        />
      ) : null}

      <Pressable
        accessibilityLabel={`Delete ${expense.title}`}
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => onDelete(expense._id)}
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
    color: appTheme.green,
    fontSize: 15,
    fontWeight: '900',
  },
  amountWrap: {
    alignItems: 'flex-end',
    gap: 8,
  },
  card: {
    alignItems: 'center',
    backgroundColor: appTheme.card,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 13,
    minHeight: 70,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'relative',
  },
  content: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  date: {
    color: '#9AA8A0',
    fontSize: 12.5,
    fontWeight: '700',
  },
  deleteButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    marginRight: -6,
    width: 34,
    zIndex: 2,
  },
  editHitArea: {
    borderRadius: 18,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 48,
    top: 0,
    zIndex: 1,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: appTheme.greenLight,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pressed: {
    opacity: 0.55,
  },
  tag: {
    backgroundColor: '#EAF2EA',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: appTheme.green,
    fontSize: 9,
    fontWeight: '800',
  },
  title: {
    color: appTheme.greenDark,
    fontSize: 15,
    fontWeight: '800',
  },
});
