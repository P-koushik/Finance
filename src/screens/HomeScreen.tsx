import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowRight,
  PiggyBank,
  TrendingUp,
  WalletCards,
} from 'lucide-react-native';

import { ConfirmCard } from '../components/ConfirmCard';
import { ExpenseCard } from '../components/ExpenseCard';
import { SavingsDrawer } from '../components/SavingsDrawer';
import { formatCurrency } from '../utils/format';
import { useSavingsViewModel } from '../view-models/useSavingsViewModel';
import { useHomeViewModel } from '../view-models/useHomeViewModel';

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const [savingsOpen, setSavingsOpen] = React.useState(false);
  const home = useHomeViewModel();
  const savings = useSavingsViewModel();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f4f8fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8fb" />

      <View className="flex-1 bg-[#f4f8fb]">
        <View className="h-16 flex-row items-center justify-between bg-white px-6">
          <View className="flex-row items-center gap-2.5">
            <WalletCards color="#2e62dd" size={24} strokeWidth={2.7} />
            <Text className="text-[20px] font-extrabold text-[#2b5fd7]">
              Finance
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Carousel
            loop={false}
            width={width}
            height={220}
            data={[0, 1]}
            pagingEnabled
            snapEnabled
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 70,
            }}
            renderItem={({ item }) => {
              if (item === 0) {
                return (
                  <View className="px-4">
                    <View className="h-[220px] rounded-[30px] bg-[#2e5f95] p-6">
                      <Text className="text-[15px] font-bold text-[#b5cae6]">
                        Total Spent
                      </Text>

                      <Text
                        className="mt-4 text-[36px] font-extrabold text-white"
                        numberOfLines={1}
                      >
                        {formatCurrency(home.totalSpent)}
                      </Text>

                      <View className="mt-7 flex-row items-center rounded-[24px] bg-white/15 p-4">
                        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#69bdc1]">
                          <TrendingUp
                            color="#ffffff"
                            size={24}
                            strokeWidth={2.7}
                          />
                        </View>

                        <View className="ml-4 flex-1">
                          <Text className="text-[13px] font-bold text-[#bdd0e7]">
                            Monthly Budget
                          </Text>
                          <Text
                            className="mt-1 text-[15px] font-extrabold text-white"
                            numberOfLines={1}
                          >
                            {formatCurrency(home.monthlyBudget)}
                          </Text>
                        </View>

                        <View className="flex-1">
                          <Text className="text-[13px] font-bold text-[#bdd0e7]">
                            Available
                          </Text>
                          <Text
                            className="mt-1 text-[15px] font-extrabold text-white"
                            numberOfLines={1}
                          >
                            {formatCurrency(home.availableMoney)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }

              return (
                <View className="px-4">
                  <Pressable
                    accessibilityRole="button"
                    className="h-[220px] justify-between rounded-[30px] bg-[#078f84] p-6 active:opacity-90"
                    onPress={() => setSavingsOpen(true)}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[15px] font-bold text-[#c7f1ec]">
                        Savings Balance
                      </Text>

                      <View className="h-11 w-11 items-center justify-center rounded-full bg-white/15">
                        <PiggyBank
                          color="#ffffff"
                          size={23}
                          strokeWidth={2.7}
                        />
                      </View>
                    </View>

                    <View>
                      <Text className="text-[15px] font-bold text-[#c7f1ec]">
                        Current Savings
                      </Text>

                      <Text
                        className="mt-1 text-[36px] font-extrabold text-white"
                        numberOfLines={1}
                      >
                        {formatCurrency(home.savingsAmount)}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              );
            }}
          />

          <View className="px-6 pb-28">
            <View className="mt-6 flex-row gap-[18px]">
              <View className="flex-1 rounded-[8px] bg-white p-[18px] shadow-sm shadow-[color:#d5dae1]">
                <Text className="text-[14px] font-bold text-[#6c7480]">
                  Top Category
                </Text>
                <Text className="mt-2 text-[16px] font-extrabold text-[#2c5c8d]">
                  {home.topCategory}
                </Text>
              </View>

              <View className="flex-1 rounded-[8px] bg-white p-[18px] shadow-sm shadow-[color:#d5dae1]">
                <Text className="text-[14px] font-bold text-[#6c7480]">
                  Daily Average
                </Text>
                <Text className="mt-2 text-[16px] font-extrabold text-[#2c5c8d]">
                  {formatCurrency(
                    home.expenses.length ? home.totalSpent / 30 : 0,
                  )}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              className="mt-5 min-h-[76px] flex-row items-center rounded-[8px] bg-white px-6 shadow-sm shadow-[color:#d5dae1] active:opacity-80"
              onPress={() => setSavingsOpen(true)}
            >
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#c9fbf2]">
                <PiggyBank color="#139b92" size={24} strokeWidth={2.7} />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-[15px] font-extrabold text-[#3c5f93]">
                  Grow Your Savings
                </Text>
                <Text className="text-[12px] font-semibold text-[#7d8794]">
                  Transfer funds to your goal
                </Text>
              </View>

              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#f1f3f5]">
                <ArrowRight color="#4f5965" size={20} strokeWidth={2.6} />
              </View>
            </Pressable>

            <View className="mb-3.5 mt-6 flex-row items-center justify-between">
              <Text className="text-[16px] font-extrabold text-[#666e78]">
                Recent Expenses
              </Text>

              {home.expenses.length > 10 ? (
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => home.navigation.navigate('AllExpenses')}
                >
                  <Text className="text-[15px] font-extrabold text-[#088b84]">
                    View All
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {home.loading ? (
              <View className="items-center py-8">
                <ActivityIndicator color="#124777" />
              </View>
            ) : home.expenses.length ? (
              <View className="gap-3.5">
                {home.visibleExpenses.map(expense => (
                  <ExpenseCard
                    expense={expense}
                    key={expense._id}
                    onDelete={home.handleDelete}
                    onPress={selectedExpense =>
                      home.navigation.navigate('EditExpense', {
                        expenseId: selectedExpense._id,
                      })
                    }
                  />
                ))}
              </View>
            ) : (
              <View className="items-center rounded-[22px] bg-white p-7">
                <Text className="mb-2 text-[17px] font-extrabold text-[#343b45]">
                  No expenses yet
                </Text>
                <Text className="text-center text-[14px] leading-[21px] text-[#7a828d]">
                  Add your first expense to start tracking total spending.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <SavingsDrawer
          onClose={() => setSavingsOpen(false)}
          open={savingsOpen}
          savings={savings}
        />

        <ConfirmCard
          confirmLabel="Delete"
          message="Remove this expense from your tracker?"
          onCancel={() => home.setExpenseToDelete(null)}
          onConfirm={home.confirmDelete}
          title="Delete expense"
          visible={Boolean(home.expenseToDelete)}
        />
      </View>
    </SafeAreaView>
  );
}
