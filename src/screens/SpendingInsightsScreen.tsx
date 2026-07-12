import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, ChartNoAxesColumnIncreasing } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Svg, { Circle, G } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { financeApi, financeQueryKeys } from '../hooks/finance-api';
import type { RootStackParamList } from '../types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const chartColors = [
  '#EF9345',
  '#68A568',
  '#4F8AC5',
  '#D66A8E',
  '#CCA51A',
  '#C45F50',
  '#7D6AAE',
  '#4EA19A',
];

const currentMonth = () => new Date().toISOString().slice(0, 7);

const compactMoney = (amount: number) => {
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  }

  if (Math.abs(amount) >= 1000) {
    return `₹${Math.round(amount / 1000)}k`;
  }

  return `₹${Math.round(amount)}`;
};

const wholeMoney = (amount: number) =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

export function SpendingInsightsScreen() {
  const navigation = useNavigation<Navigation>();
  const month = currentMonth();
  const categoriesQuery = useQuery({
    queryKey: financeQueryKeys.spendingCategories(month),
    queryFn: () => financeApi.getSpendingByCategory(month),
  });
  const monthlyQuery = useQuery({
    queryKey: financeQueryKeys.spendingMonthly(6, month),
    queryFn: () => financeApi.getMonthlySpending(6, month),
  });

  const categories = useMemo(
    () => categoriesQuery.data?.categories ?? [],
    [categoriesQuery.data?.categories],
  );
  const monthly = monthlyQuery.data?.months ?? [];
  const maxMonthlyAmount = Math.max(...monthly.map(item => item.amount), 1);
  const donutSegments = useMemo(() => {
    const radius = 53;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return categories.map((category, index) => {
      const length = (category.percentage / 100) * circumference;
      const segment = {
        ...category,
        color: chartColors[index % chartColors.length],
        dash: `${length} ${circumference - length}`,
        offset: -offset,
      };
      offset += length;
      return segment;
    });
  }, [categories]);
  const change = monthlyQuery.data?.change_percentage;
  const isLoading = categoriesQuery.isLoading || monthlyQuery.isLoading;
  const hasError = categoriesQuery.isError || monthlyQuery.isError;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#EEF4EE]">
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />

      <View className="flex-row items-center gap-3 px-5 pb-4 pt-3">
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-[14px] bg-white active:opacity-80"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#2E5D4B" size={21} strokeWidth={2.5} />
        </Pressable>
        <Text className="text-[21px] font-black text-[#24352E]">
          Spending insights
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2E5D4B" />
        </View>
      ) : hasError ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-[#EAF2EA]">
            <ChartNoAxesColumnIncreasing
              color="#2E5D4B"
              size={27}
              strokeWidth={2.5}
            />
          </View>
          <Text className="mt-4 text-[17px] font-black text-[#24352E]">
            Could not load insights
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-4 px-5 pb-12"
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-[26px] border border-[#EDF3ED] bg-white p-[22px] shadow-sm">
            <Text className="text-[16px] font-black text-[#24352E]">
              This month by category
            </Text>
            <Text className="mt-1 text-[12px] font-bold text-[#9AA8A0]">
              {categoriesQuery.data?.label ?? month}
            </Text>

            <View className="mt-5 flex-row items-center gap-5">
              <View className="h-[140px] w-[140px] items-center justify-center">
                <Svg height="140" viewBox="0 0 140 140" width="140">
                  <G rotation="-90" origin="70, 70">
                    <Circle
                      cx="70"
                      cy="70"
                      fill="none"
                      r="53"
                      stroke="#EAF2EA"
                      strokeWidth="27"
                    />
                    {donutSegments.map(segment => (
                      <Circle
                        cx="70"
                        cy="70"
                        fill="none"
                        key={segment.category}
                        r="53"
                        stroke={segment.color}
                        strokeDasharray={segment.dash}
                        strokeDashoffset={segment.offset}
                        strokeWidth="27"
                      />
                    ))}
                  </G>
                </Svg>
                <View className="absolute inset-0 items-center justify-center">
                  <Text className="text-[11px] font-extrabold text-[#9AA8A0]">
                    Total
                  </Text>
                  <Text
                    className="mt-0.5 max-w-[86px] text-[18px] font-black text-[#24352E]"
                    numberOfLines={1}
                  >
                    {wholeMoney(categoriesQuery.data?.total ?? 0)}
                  </Text>
                </View>
              </View>

              <View className="min-w-0 flex-1 gap-[10px]">
                {donutSegments.slice(0, 6).map(segment => (
                  <View
                    className="flex-row items-center gap-2"
                    key={segment.category}
                  >
                    <View
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <Text
                      className="min-w-0 flex-1 text-[12px] font-extrabold capitalize text-[#52645B]"
                      numberOfLines={1}
                    >
                      {segment.category}
                    </Text>
                    <Text className="text-[12px] font-black text-[#24352E]">
                      {Math.round(segment.percentage)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="rounded-[26px] border border-[#EDF3ED] bg-white p-[22px] shadow-sm">
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-[16px] font-black text-[#24352E]">
                  Month over month
                </Text>
                <Text className="mt-1 text-[12px] font-bold text-[#9AA8A0]">
                  vs last month
                </Text>
              </View>
              {change !== null && change !== undefined ? (
                <Text
                  className={`text-[14px] font-black ${
                    change > 0 ? 'text-[#C4614E]' : 'text-[#3E8E6E]'
                  }`}
                >
                  {change > 0 ? '+' : ''}
                  {Math.round(change)}%
                </Text>
              ) : null}
            </View>

            <View className="mt-6 h-[154px] flex-row items-end justify-between gap-2">
              {monthly.map((item, index) => {
                const height = Math.max(
                  (item.amount / maxMonthlyAmount) * 104,
                  item.amount > 0 ? 8 : 2,
                );
                const isLatest = index === monthly.length - 1;

                return (
                  <View className="flex-1 items-center" key={item.month}>
                    <Text
                      className="mb-2 text-[10px] font-black text-[#6E9081]"
                      numberOfLines={1}
                    >
                      {compactMoney(item.amount)}
                    </Text>
                    <View
                      className={`w-full max-w-[42px] rounded-t-[9px] ${
                        isLatest ? 'bg-[#326650]' : 'bg-[#CFE1CC]'
                      }`}
                      style={{ height }}
                    />
                    <Text className="mt-2 text-[11px] font-extrabold text-[#9AA8A0]">
                      {item.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
