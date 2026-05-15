import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CirclePlus, Home, User } from 'lucide-react-native';

import type { RootTabParamList } from '../types';

type TabRouteName = keyof RootTabParamList;

const tabItems: Record<
  TabRouteName,
  { key: string; label: string; Icon: typeof Home }
> = {
  Home: { key: 'home', label: 'Home', Icon: Home },
  AddExpense: { key: 'add', label: 'Add', Icon: CirclePlus },
  Profile: { key: 'profile', label: 'Profile', Icon: User },
};

export function BottomBar({
  descriptors,
  navigation,
  state,
}: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const routeName = route.name as TabRouteName;
        const { Icon, key, label } = tabItems[routeName];
        const selected = state.index === index;
        const options = descriptors[route.key]?.options;

        return (
          <Pressable
            accessibilityLabel={options?.tabBarAccessibilityLabel}
            accessibilityRole="button"
            accessibilityState={selected ? { selected: true } : {}}
            key={key}
            onPress={() => {
              const event = navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: 'tabPress',
              });

              if (!selected && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            className="items-center gap-1.5 min-w-12"
          >
            <Icon
              color={selected ? '#2e62dd' : '#a8b0bb'}
              size={22}
              strokeWidth={2.4}
            />
            <Text
              style={[styles.label, selected && styles.activeLabel]}
              className="text-[10px] font-extrabold"
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeLabel: {
    color: '#2e62dd',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 8,
    flexDirection: 'row',
    height: 74,
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    shadowColor: '#d3d8df',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
  },
  item: {
    alignItems: 'center',
    gap: 5,
    minWidth: 50,
  },
  label: {
    color: '#9aa3af',
    fontSize: 10,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.65,
  },
});
