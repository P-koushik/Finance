import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { AllExpensesScreen } from './src/screens/AllExpensesScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ToastProvider } from './src/components/ToastProvider';
import { StoragePermissionPrompt } from './src/components/StoragePermissionPrompt';
import type { RootStackParamList } from './src/types';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <StoragePermissionPrompt />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen component={HomeScreen} name="Home" />
            <Stack.Screen component={AddExpenseScreen} name="AddExpense" />
            <Stack.Screen component={AllExpensesScreen} name="AllExpenses" />
            <Stack.Screen component={ProfileScreen} name="Profile" />
          </Stack.Navigator>
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default App;
