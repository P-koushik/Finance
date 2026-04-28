import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BadgeDollarSign,
  CalendarDays,
  Car,
  CircleEllipsis,
  ShoppingBag,
  Utensils,
  WalletCards,
  Zap,
} from 'lucide-react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '../components/BottomBar';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useToast } from '../components/ToastProvider';
import type { Expense, ExpenseCategory, RootStackParamList } from '../types';
import { addExpense, getSettings } from '../utils/storage';

type AddExpenseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AddExpense'
>;

export function AddExpenseScreen({ navigation }: AddExpenseScreenProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const parsedAmount = useMemo(
    () => Number(amount.replace(/,/g, '')),
    [amount],
  );
  const selectedCategory =
    category === 'Other' ? customCategory.trim() : category;
  const canSave =
    title.trim().length > 0 &&
    parsedAmount > 0 &&
    selectedCategory.length > 0 &&
    !saving;

  const handleSave = async () => {
    if (!canSave) {
      showToast({
        type: 'error',
        title: 'Missing details',
        message: 'Enter a title, amount, and category before saving.',
      });
      return;
    }

    setSaving(true);

    const expense: Expense = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      amount: parsedAmount,
      category: selectedCategory,
      createdAt: selectedDate.toISOString(),
    };

    try {
      const settings = await getSettings();

      if (!settings.localStorageEnabled) {
        showToast({
          type: 'error',
          title: 'Storage disabled',
          message:
            'Turn on Local Storage in Profile settings before saving expenses.',
        });
        return;
      }

      await addExpense(expense);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { label: 'Food', Icon: Utensils },
    { label: 'Travel', Icon: Car },
    { label: 'Utilities', Icon: Zap },
    { label: 'Other', Icon: CircleEllipsis },
  ];

  const dateLabel = selectedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const selectedDateKey = selectedDate.toISOString().split('T')[0];

  const handleDayPress = (day: DateData) => {
    setSelectedDate(new Date(`${day.dateString}T12:00:00.000Z`));
    setDatePickerVisible(false);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.screen}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <WalletCards color="#2e62dd" size={24} strokeWidth={2.7} />
            <Text style={styles.brandText}>Finance</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroOverlay} />
            <View style={styles.heroLines}>
              <View style={styles.heroLineWide} />
              <View style={styles.heroLineShort} />
              <View style={styles.heroLineMedium} />
            </View>
            <Text style={styles.heroTitle}>Add New Expense</Text>
            <Text style={styles.heroSubtitle}>
              Keep your financial clarity by logging every spend.
            </Text>
          </View>

          <View style={styles.formCard}>
            <InputField
              icon={ShoppingBag}
              label="Expense Title"
              onChangeText={setTitle}
              placeholder="e.g. Weekly Groceries"
              returnKeyType="next"
              value={title}
            />

            <InputField
              icon={BadgeDollarSign}
              keyboardType="decimal-pad"
              label="Amount"
              onChangeText={setAmount}
              placeholder="0.00"
              prefix="₹"
              returnKeyType="done"
              value={amount}
            />

            <View style={styles.categoryGroup}>
              <Text style={styles.label}>Quick Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map(({ label, Icon }) => {
                  const selected = category === label;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={label}
                      onPress={() => setCategory(label as ExpenseCategory)}
                      style={[
                        styles.categoryPill,
                        selected && styles.categoryPillSelected,
                      ]}
                    >
                      <Icon
                        color={selected ? '#117b78' : '#6f7782'}
                        size={18}
                        strokeWidth={2.4}
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          selected && styles.categoryTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {category === 'Other' ? (
              <InputField
                icon={CircleEllipsis}
                label="Category Name"
                onChangeText={setCustomCategory}
                placeholder="e.g. Medical, Gifts, Education"
                returnKeyType="next"
                value={customCategory}
              />
            ) : null}

            <View style={styles.dateGroup}>
              <Text style={styles.label}>Date</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDatePickerVisible(true)}
                style={({ pressed }) => [
                  styles.dateBox,
                  pressed && styles.pressed,
                ]}
              >
                <CalendarDays color="#747c88" size={22} strokeWidth={2.4} />
                <Text style={styles.dateText}>{dateLabel}</Text>
              </Pressable>
            </View>
          </View>

          <PrimaryButton
            disabled={!canSave}
            label="Save Expense"
            loading={saving}
            onPress={handleSave}
            style={styles.saveButton}
          />
        </ScrollView>

        <Modal
          animationType="fade"
          transparent
          visible={datePickerVisible}
          onRequestClose={() => setDatePickerVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.dateModal}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <Calendar
                current={selectedDateKey}
                markedDates={{
                  [selectedDateKey]: {
                    selected: true,
                    selectedColor: '#078f84',
                    selectedTextColor: '#ffffff',
                  },
                }}
                onDayPress={handleDayPress}
                theme={{
                  arrowColor: '#124777',
                  monthTextColor: '#2f3742',
                  selectedDayBackgroundColor: '#078f84',
                  textDayFontWeight: '600',
                  textMonthFontWeight: '900',
                  textSectionTitleColor: '#6f7782',
                  todayTextColor: '#2e62dd',
                }}
              />
              <PrimaryButton
                label="Close Calendar"
                onPress={() => setDatePickerVisible(false)}
                style={styles.modalButton}
              />
            </View>
          </View>
        </Modal>

        <BottomBar active="add" />
      </KeyboardAvoidingView>
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryGroup: {
    gap: 12,
  },
  categoryPill: {
    alignItems: 'center',
    backgroundColor: '#e9edf0',
    borderRadius: 21,
    flexDirection: 'row',
    gap: 7,
    minHeight: 40,
    paddingHorizontal: 16,
  },
  categoryPillSelected: {
    backgroundColor: '#75e5df',
  },
  categoryText: {
    color: '#606872',
    fontSize: 15,
    fontWeight: '800',
  },
  categoryTextSelected: {
    color: '#117b78',
  },
  content: {
    padding: 22,
    paddingBottom: 44,
  },
  dateBox: {
    alignItems: 'center',
    backgroundColor: '#eef1f4',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 16,
    height: 58,
    paddingHorizontal: 18,
  },
  dateGroup: {
    gap: 10,
  },
  dateText: {
    color: '#626a75',
    fontSize: 16,
    fontWeight: '700',
  },
  dateModal: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    gap: 20,
    marginHorizontal: 24,
    padding: 24,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 2,
    gap: 28,
    marginTop: 30,
    padding: 24,
    shadowColor: '#d5dae1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  hero: {
    backgroundColor: '#1f506f',
    borderRadius: 8,
    height: 172,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    padding: 22,
  },
  heroLineMedium: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 5,
    height: 9,
    width: 200,
  },
  heroLineShort: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 5,
    height: 9,
    width: 130,
  },
  heroLines: {
    gap: 14,
    left: 28,
    position: 'absolute',
    top: 28,
    transform: [{ rotate: '-10deg' }],
  },
  heroLineWide: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 5,
    height: 9,
    width: 240,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 38, 54, 0.28)',
  },
  heroSubtitle: {
    color: '#c8d7e6',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    width: '78%',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  label: {
    color: '#686e78',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    flex: 1,
    justifyContent: 'center',
  },
  modalButton: {
    height: 56,
  },
  modalTitle: {
    color: '#2f3742',
    fontSize: 20,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
  safeArea: {
    backgroundColor: '#f4f8fb',
    flex: 1,
  },
  saveButton: {
    marginTop: 30,
  },
  screen: {
    backgroundColor: '#f4f8fb',
    flex: 1,
  },
});
