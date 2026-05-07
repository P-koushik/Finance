import React from 'react';
import './global.css';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { AllExpensesScreen } from './src/screens/AllExpensesScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { ToastProvider } from './src/components/ToastProvider';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import type { RootStackParamList } from './src/types';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

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
            <Stack.Screen component={HomeScreen} name="Home" />
            <Stack.Screen component={AddExpenseScreen} name="AddExpense" />
            <Stack.Screen component={AllExpensesScreen} name="AllExpenses" />
            <Stack.Screen component={ProfileScreen} name="Profile" />
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
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default App;
