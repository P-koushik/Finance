import React from 'react';
import './global.css';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from '@tanstack/react-query';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { AllExpensesScreen } from './src/screens/AllExpensesScreen';
import { EditExpenseScreen } from './src/screens/EditExpenseScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SavingsScreen } from './src/screens/SavingsScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';

import { BottomBar } from './src/components/BottomBar';
import { ToastProvider } from './src/components/ToastProvider';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { queryClient } from './src/lib/query-client';

import type { RootStackParamList, RootTabParamList } from './src/types';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function renderBottomBar(props: BottomTabBarProps) {
  return <BottomBar {...props} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={renderBottomBar}
    >
      <Tab.Screen component={HomeScreen} name="Home" />
      <Tab.Screen component={AddExpenseScreen} name="AddExpense" />
      <Tab.Screen component={SavingsScreen} name="Savings" />
      <Tab.Screen component={ProfileScreen} name="Profile" />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { initializing, user } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f4f8fb]">
        <ActivityIndicator color="#124777" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen component={MainTabs} name="MainTabs" />
            <Stack.Screen component={EditExpenseScreen} name="EditExpense" />
            <Stack.Screen component={AllExpensesScreen} name="AllExpenses" />
          </>
        ) : (
          <>
            <Stack.Screen component={LoginScreen} name="Login" />
            <Stack.Screen component={SignUpScreen} name="SignUp" />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ToastProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </ToastProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
