import React, { useEffect, useRef, useState } from 'react';
import './global.css';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from '@tanstack/react-query';
import { Animated, Easing, Image, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { AddGroupMembersScreen } from './src/screens/AddGroupMembersScreen';
import { AddSplitGroupMembersScreen } from './src/screens/AddSplitGroupMembersScreen';
import { AllExpensesScreen } from './src/screens/AllExpensesScreen';
import { CreateGroupExpenseScreen } from './src/screens/CreateGroupExpenseScreen';
import { CreateGroupScreen } from './src/screens/CreateGroupScreen';
import { CreateSplitExpenseScreen } from './src/screens/CreateSplitExpenseScreen';
import { CreateSplitGroupScreen } from './src/screens/CreateSplitGroupScreen';
import { EditExpenseScreen } from './src/screens/EditExpenseScreen';
import { GroupDetailsScreen } from './src/screens/GroupDetailsScreen';
import { GroupSettingsScreen } from './src/screens/GroupSettingsScreen';
import { GroupsScreen } from './src/screens/GroupsScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { SplitBalancesScreen } from './src/screens/SplitBalancesScreen';
import { SplitGroupDetailsScreen } from './src/screens/SplitGroupDetailsScreen';
import { SplitGroupSettingsScreen } from './src/screens/SplitGroupSettingsScreen';
import { SplitGroupsScreen } from './src/screens/SplitGroupsScreen';
import { SpendingInsightsScreen } from './src/screens/SpendingInsightsScreen';

import { BottomBar } from './src/components/BottomBar';
import { ToastProvider } from './src/components/ToastProvider';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { queryClient } from './src/lib/query-client';

import type { RootStackParamList, RootTabParamList } from './src/types';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const appLogo = require('./src/assets/app-logo.png');
const SPLASH_HOLD_MS = 10;
const SPLASH_FADE_MS = 760;

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
      <Tab.Screen component={GroupsScreen} name="Groups" />
      <Tab.Screen component={AddExpenseScreen} name="AddExpense" />
      <Tab.Screen component={SplitGroupsScreen} name="SplitGroups" />
      <Tab.Screen component={ProfileScreen} name="Profile" />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { initializing, user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const splashProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (initializing) {
      return;
    }

    const animation = Animated.sequence([
      Animated.delay(SPLASH_HOLD_MS),
      Animated.timing(splashProgress, {
        duration: SPLASH_FADE_MS,
        easing: Easing.inOut(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        setShowSplash(false);
      }
    });

    return () => animation.stop();
  }, [initializing, splashProgress]);

  const splashOpacity = splashProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const appOpacity = splashProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  return (
    <View className="flex-1 bg-[#f4f8fb]">
      {!initializing ? (
        <Animated.View className="flex-1" style={{ opacity: appOpacity }}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {user ? (
                <>
                  <Stack.Screen component={MainTabs} name="MainTabs" />
                  <Stack.Screen
                    component={EditExpenseScreen}
                    name="EditExpense"
                  />
                  <Stack.Screen
                    component={AllExpensesScreen}
                    name="AllExpenses"
                  />
                  <Stack.Screen
                    component={SpendingInsightsScreen}
                    name="SpendingInsights"
                  />
                  <Stack.Screen
                    component={GroupDetailsScreen}
                    name="GroupDetails"
                  />
                  <Stack.Screen
                    component={GroupSettingsScreen}
                    name="GroupSettings"
                  />
                  <Stack.Screen
                    component={CreateGroupScreen}
                    name="CreateGroup"
                  />
                  <Stack.Screen
                    component={CreateGroupExpenseScreen}
                    name="CreateGroupExpense"
                  />
                  <Stack.Screen
                    component={AddGroupMembersScreen}
                    name="AddGroupMembers"
                  />
                  <Stack.Screen
                    component={SplitGroupDetailsScreen}
                    name="SplitGroupDetails"
                  />
                  <Stack.Screen
                    component={SplitGroupSettingsScreen}
                    name="SplitGroupSettings"
                  />
                  <Stack.Screen
                    component={CreateSplitGroupScreen}
                    name="CreateSplitGroup"
                  />
                  <Stack.Screen
                    component={CreateSplitExpenseScreen}
                    name="CreateSplitExpense"
                  />
                  <Stack.Screen
                    component={AddSplitGroupMembersScreen}
                    name="AddSplitGroupMembers"
                  />
                  <Stack.Screen
                    component={SplitBalancesScreen}
                    name="SplitBalances"
                  />
                </>
              ) : (
                <>
                  <Stack.Screen component={LoginScreen} name="Login" />
                  <Stack.Screen component={SignUpScreen} name="SignUp" />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </Animated.View>
      ) : null}

      {(initializing || showSplash) && (
        <Animated.View
          className="absolute inset-0 items-center justify-center bg-[#f4f8fb]"
          pointerEvents="none"
          style={{ opacity: splashOpacity }}
        >
          <Image
            accessibilityIgnoresInvertColors
            accessibilityLabel="Finance"
            className="h-56 w-56"
            resizeMode="contain"
            source={appLogo}
          />
        </Animated.View>
      )}
    </View>
  );
}

function App() {
  return (
    <GestureHandlerRootView className="flex-1">
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
