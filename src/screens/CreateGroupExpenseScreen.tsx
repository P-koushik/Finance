import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  CirclePlus,
  ReceiptText,
  Tag,
  Trash2,
  Wallet,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { GroupExpenseItem, RootStackParamList } from '../types';
import { formatMoneyString } from '../utils/format';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CreateGroupExpense'>;

type DraftItem = Pick<GroupExpenseItem, 'title' | 'amount'>;

const parseAmount = (value: string) => Number(value.replace(/,/g, ''));

export function CreateGroupExpenseScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const queryClient = useQueryClient();
  const { groupId } = route.params;
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [paidBy, setPaidBy] = useState('');

  const groupQuery = useQuery({
    queryKey: financeQueryKeys.group(groupId),
    queryFn: () => financeApi.getGroup(groupId),
  });
  const activeMembers =
    groupQuery.data?.members.filter(member => member.status === 'active') ?? [];
  const parsedAmount = parseAmount(amount);
  const itemSubtotal = useMemo(
    () =>
      items.reduce((total, item) => total + (parseAmount(item.amount) || 0), 0),
    [items],
  );
  const hasItems = items.some(item => item.title.trim() || item.amount.trim());
  const usableItems = items
    .filter(item => item.title.trim() && parseAmount(item.amount) > 0)
    .map(item => ({
      title: item.title.trim(),
      amount: item.amount.trim(),
    }));
  const itemSubtotalMatches =
    !hasItems || Math.abs(itemSubtotal - parsedAmount) < 0.01;
  const canSave =
    Boolean(title.trim()) &&
    Boolean(category.trim()) &&
    parsedAmount > 0 &&
    Boolean(paidBy) &&
    itemSubtotalMatches &&
    !groupQuery.isLoading;

  const createExpense = useMutation({
    mutationFn: () =>
      financeApi.createGroupExpense(groupId, {
        title: title.trim(),
        amount: amount.trim(),
        paid_by: paidBy,
        date: new Date().toISOString(),
        category: category.trim(),
        notes: notes.trim(),
        items: usableItems,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: financeQueryKeys.groupExpenses(groupId),
      });
      navigation.goBack();
    },
    onError: () => Alert.alert('Group expense', 'Could not create expense.'),
  });

  const updateItem = (
    index: number,
    key: keyof DraftItem,
    nextValue: string,
  ) => {
    setItems(current =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: nextValue } : item,
      ),
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#EEF4EE]">
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />
      <ScrollView
        contentContainerClassName="gap-5 px-5 pb-10 py-3"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-1 flex-row items-center gap-3">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-[13px] bg-white active:opacity-80"
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#24352E" size={21} strokeWidth={2.5} />
          </Pressable>
          <Text className="text-[20px] font-black text-[#24352E]">
            Add expense
          </Text>
        </View>

        <View className="items-center py-3">
          <Text className="text-[13px] font-extrabold text-[#8D9B93]">
            Amount
          </Text>
          <Text
            className="mt-1 text-[44px] font-black text-[#24352E]"
            numberOfLines={1}
          >
            {formatMoneyString(parsedAmount || 0)}
          </Text>
        </View>

        <InputField
          icon={ReceiptText}
          label="What for?"
          onChangeText={setTitle}
          placeholder="Groceries"
          value={title}
        />
        <InputField
          icon={Wallet}
          keyboardType="decimal-pad"
          label="Amount"
          onChangeText={setAmount}
          placeholder="3000.00"
          prefix="₹"
          value={amount}
        />
        <InputField
          icon={Tag}
          label="Category"
          onChangeText={setCategory}
          placeholder="Household"
          value={category}
        />
        <InputField
          icon={ReceiptText}
          label="Notes"
          onChangeText={setNotes}
          placeholder="Optional"
          value={notes}
        />
        <InputField
          editable={false}
          icon={CalendarDays}
          label="Date"
          onChangeText={() => undefined}
          placeholder=""
          value={new Date().toLocaleDateString()}
        />

        <View className="gap-2 rounded-[22px] border border-[#EDF3ED] bg-white p-4">
          <Text className="text-[15px] font-black text-[#24352E]">Paid by</Text>
          {activeMembers.map(member => {
            const selected = paidBy === member.user.id;

            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className="flex-row items-center gap-3 rounded-[16px] bg-[#F6FAF6] px-3 py-3 active:opacity-80"
                key={member.user.id}
                onPress={() => setPaidBy(member.user.id)}
              >
                {selected ? (
                  <CheckCircle2 color="#2E5D4B" size={19} strokeWidth={2.5} />
                ) : (
                  <Circle color="#9AA8A0" size={19} strokeWidth={2.2} />
                )}
                <Text className="flex-1 text-[13px] font-extrabold text-[#24352E]">
                  {member.user.name || member.user.email || member.user.id}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="gap-3 rounded-[22px] border border-[#EDF3ED] bg-white p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-black text-[#24352E]">
                Sub Expenses
              </Text>
              <Text className="mt-1 text-[12px] font-bold text-[#8D9B93]">
                Item subtotal {formatMoneyString(itemSubtotal)}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#EAF2EA] active:opacity-80"
              onPress={() =>
                setItems(current => [...current, { title: '', amount: '' }])
              }
            >
              <CirclePlus color="#2E5D4B" size={21} strokeWidth={2.5} />
            </Pressable>
          </View>

          {items.map((item, index) => (
            <View className="gap-3 rounded-[18px] bg-[#F6FAF6] p-3" key={index}>
              <InputField
                icon={ReceiptText}
                label="Item"
                onChangeText={value => updateItem(index, 'title', value)}
                placeholder="Milk"
                value={item.title}
              />
              <View className="flex-row items-end gap-3">
                <View className="flex-1">
                  <InputField
                    icon={Wallet}
                    keyboardType="decimal-pad"
                    label="Amount"
                    onChangeText={value => updateItem(index, 'amount', value)}
                    placeholder="100.00"
                    prefix="₹"
                    value={item.amount}
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  className="mb-1 h-[54px] w-12 items-center justify-center rounded-[16px] bg-[#F8E9E5] active:opacity-80"
                  onPress={() =>
                    setItems(current =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  <Trash2 color="#C4614E" size={19} strokeWidth={2.5} />
                </Pressable>
              </View>
            </View>
          ))}

          {!itemSubtotalMatches ? (
            <Text className="text-[12px] font-bold text-[#C4614E]">
              Item subtotal must match the expense amount.
            </Text>
          ) : null}
        </View>

        <PrimaryButton
          className="rounded-[18px] bg-[#2E5D4B]"
          disabled={!canSave}
          label="Add expense"
          loading={createExpense.isPending}
          onPress={() => createExpense.mutate()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
