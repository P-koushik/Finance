import React from 'react';
import {
  ActivityIndicator,
  DimensionValue,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Carousel, {
  type ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowUpRight,
  CirclePlus,
  PiggyBank,
  Scale,
  TrendingUp,
  UsersRound,
  WalletCards,
} from 'lucide-react-native';

import { ConfirmCard } from '../components/ConfirmCard';
import { ExpenseCard } from '../components/ExpenseCard';
import { SavingsDrawer } from '../components/SavingsDrawer';
import { formatCurrency } from '../utils/format';
import { useHomeViewModel } from '../view-models/useHomeViewModel';
import { useSavingsViewModel } from '../view-models/useSavingsViewModel';

const appLogo = require('../assets/app-logo.png');
const carouselData = [0, 1];

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const [savingsOpen, setSavingsOpen] = React.useState(false);
  const carouselRef = React.useRef<ICarouselInstance>(null);
  const carouselProgress = useSharedValue(0);
  const home = useHomeViewModel();
  const savings = useSavingsViewModel();
  const spentPct =
    home.monthlyBudget > 0
      ? `${Math.min((home.totalSpent / home.monthlyBudget) * 100, 100)}%`
      : '0%';
  const spentPctWidth = spentPct as DimensionValue;
  const savingsProgress =
    (savings.profile.savings_goal ?? 0) > 0
      ? Math.min(
          (home.savingsAmount / (savings.profile.savings_goal ?? 0)) * 100,
          100,
        )
      : 0;
  const savingsPctWidth = `${savingsProgress}%` as DimensionValue;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#EEF4EE]">
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />

      <View className="flex-1 bg-[#EEF4EE]">
        <ScrollView
          refreshControl={
            <RefreshControl
              colors={['#2E5D4B']}
              onRefresh={home.refresh}
              refreshing={home.refreshing}
              tintColor="#2E5D4B"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 pb-44 pt-2">
            <View className="flex-row items-center gap-3 pb-5">
              <Image
                className="h-[42px] w-[42px] rounded-[13px]"
                source={appLogo}
              />
              <Text
                className="min-w-0 flex-1 text-[20px] font-black text-[#24352E]"
                numberOfLines={1}
              >
                Finance
              </Text>
            </View>

            <Carousel
              data={carouselData}
              height={224}
              loop={false}
              onProgressChange={carouselProgress}
              pagingEnabled
              ref={carouselRef}
              renderItem={({ item }) => {
                if (item === 0) {
                  return (
                    <View className="h-[212px] rounded-[28px] bg-[#2E5D4B] p-[22px]">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[14px] font-extrabold text-white/85">
                          Spendable this month
                        </Text>
                        <WalletCards
                          color="#DDECE2"
                          size={22}
                          strokeWidth={2.5}
                        />
                      </View>
                      <Text
                        className="mt-3 text-[40px] font-black text-white"
                        numberOfLines={1}
                      >
                        {formatCurrency(home.availableMoney)}
                      </Text>
                      <Text className="mt-0.5 text-[13px] font-bold text-white/80">
                        of {formatCurrency(home.monthlyBudget)} budget left
                      </Text>
                      <View className="mt-[18px] h-2 overflow-hidden rounded-md bg-white/20">
                        <View
                          className="h-full rounded-md bg-[#C9E8B4]"
                          style={{ width: spentPctWidth }}
                        />
                      </View>
                      <Text className="mt-2 text-[12.5px] font-bold text-white/80">
                        {formatCurrency(home.totalSpent)} spent so far
                      </Text>
                    </View>
                  );
                }

                return (
                  <Pressable
                    accessibilityRole="button"
                    className="h-[212px] overflow-hidden rounded-[28px] border border-[#CFE1D1] bg-[#DFEEE2] p-[22px] active:opacity-90"
                    onPress={() => setSavingsOpen(true)}
                  >
                    <View className="absolute -right-7 -top-9 h-32 w-32 rounded-full bg-white/30" />
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-[14px] font-black text-[#2E5D4B]">
                          Savings pocket
                        </Text>
                        <Text className="mt-0.5 text-[11.5px] font-bold text-[#6E9081]">
                          Building your safety net
                        </Text>
                      </View>
                      <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-white/80">
                        <PiggyBank
                          color="#2E5D4B"
                          size={23}
                          strokeWidth={2.5}
                        />
                      </View>
                    </View>
                    <Text
                      className="mt-3 text-[35px] font-black text-[#24352E]"
                      numberOfLines={1}
                    >
                      {formatCurrency(home.savingsAmount)}
                    </Text>
                    <View className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
                      <View
                        className="h-full rounded-full bg-[#3C7A5E]"
                        style={{ width: savingsPctWidth }}
                      />
                    </View>
                    <View className="mt-2 flex-row items-center justify-between">
                      <Text className="text-[11.5px] font-extrabold text-[#6E9081]">
                        {Math.round(savingsProgress)}% of{' '}
                        {formatCurrency(savings.profile.savings_goal ?? 0)} goal
                      </Text>
                      <View className="flex-row items-center gap-1 rounded-[12px] bg-white/80 px-3 py-2">
                        <Text className="text-[12px] font-black text-[#2E5D4B]">
                          Move money
                        </Text>
                        <ArrowUpRight
                          color="#2E5D4B"
                          size={15}
                          strokeWidth={2.7}
                        />
                      </View>
                    </View>
                  </Pressable>
                );
              }}
              snapEnabled
              width={width - 40}
            />

            <Pagination.Basic
              activeDotStyle={styles.activeDot}
              containerStyle={styles.pagination}
              data={carouselData}
              dotStyle={styles.dot}
              onPress={index =>
                carouselRef.current?.scrollTo({
                  animated: true,
                  count: index - carouselProgress.value,
                })
              }
              progress={carouselProgress}
            />

            <View className="mb-6 flex-row justify-between gap-2">
              {[
                {
                  label: 'Add',
                  Icon: CirclePlus,
                  onPress: () =>
                    home.navigation.navigate('MainTabs', {
                      screen: 'AddExpense',
                    }),
                },
                {
                  label: 'Groups',
                  Icon: UsersRound,
                  onPress: () =>
                    home.navigation.navigate('MainTabs', { screen: 'Groups' }),
                },
                {
                  label: 'Split',
                  Icon: Scale,
                  onPress: () =>
                    home.navigation.navigate('MainTabs', {
                      screen: 'SplitGroups',
                    }),
                },
                {
                  label: 'Insights',
                  Icon: TrendingUp,
                  onPress: () => home.navigation.navigate('SpendingInsights'),
                },
              ].map(({ Icon, label, onPress }) => (
                <Pressable
                  accessibilityRole="button"
                  className="flex-1 items-center gap-2 active:opacity-80"
                  key={label}
                  onPress={onPress}
                >
                  <View className="h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-white">
                    <Icon color="#2E5D4B" size={23} strokeWidth={2.5} />
                  </View>
                  <Text className="text-[11.5px] font-extrabold text-[#5B6B63]">
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-[17px] font-black text-[#24352E]">
                Recent activity
              </Text>
              {home.expenses.length ? (
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => home.navigation.navigate('AllExpenses')}
                >
                  <Text className="text-[13px] font-extrabold text-[#6E9081]">
                    See all
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {home.loading ? (
              <View className="items-center py-8">
                <ActivityIndicator color="#2E5D4B" />
              </View>
            ) : home.visibleExpenses.length ? (
              <View className="gap-2 rounded-[24px] border border-[#EDF3ED] bg-white p-3">
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
              <View className="items-center rounded-[24px] border border-[#EDF3ED] bg-white p-7">
                <TrendingUp color="#7FA968" size={30} strokeWidth={2.5} />
                <Text className="mb-2 mt-3 text-[17px] font-extrabold text-[#24352E]">
                  No expenses this month
                </Text>
                <Text className="text-center text-[14px] leading-[21px] text-[#8D9B93]">
                  Transactions from the current month will appear here.
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

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: '#2E5D4B',
    borderRadius: 3,
    height: 6,
    overflow: 'hidden',
    width: 18,
  },
  dot: {
    backgroundColor: '#C4D6C4',
    borderRadius: 3,
    height: 6,
    overflow: 'hidden',
    width: 6,
  },
  pagination: {
    alignSelf: 'center',
    gap: 6,
    marginBottom: 20,
    marginTop: 8,
  },
});
