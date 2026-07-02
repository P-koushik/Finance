import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CirclePlus, Home, Scale, User, UsersRound } from 'lucide-react-native';

import type { RootTabParamList } from '../types';
import { appTheme } from '../styles/theme';

type TabRouteName = keyof RootTabParamList;

const tabItems: Record<
  TabRouteName,
  { key: string; label: string; Icon: typeof Home }
> = {
  Home: { key: 'home', label: 'Home', Icon: Home },
  Groups: { key: 'groups', label: 'Groups', Icon: UsersRound },
  AddExpense: { key: 'add', label: 'Add', Icon: CirclePlus },
  SplitGroups: { key: 'splits', label: 'Splits', Icon: Scale },
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
        const isAdd = routeName === 'AddExpense';

        return (
          <Pressable
            accessibilityLabel={options?.tabBarAccessibilityLabel}
            accessibilityRole="button"
            accessibilityState={selected ? { selected: true } : {}}
            className="items-center"
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
            style={({ pressed }) => [
              styles.item,
              isAdd && styles.addItem,
              pressed && styles.pressed,
            ]}
          >
            {isAdd ? (
              <View style={styles.fab}>
                <Icon color="#ffffff" size={28} strokeWidth={2.8} />
              </View>
            ) : (
              <>
                <Icon
                  color={selected ? appTheme.green : '#B4C2BA'}
                  size={22}
                  strokeWidth={2.4}
                />
                <Text
                  className="text-[10px] font-extrabold"
                  style={[styles.label, selected && styles.activeLabel]}
                >
                  {label}
                </Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeLabel: {
    color: appTheme.green,
  },
  container: {
    alignItems: 'center',
    backgroundColor: appTheme.card,
    borderColor: appTheme.border,
    borderRadius: 26,
    borderWidth: 1,
    bottom: 12,
    elevation: 8,
    flexDirection: 'row',
    height: 66,
    justifyContent: 'space-around',
    left: 16,
    paddingHorizontal: 8,
    position: 'absolute',
    right: 16,
    shadowColor: appTheme.green,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
  },
  addItem: {
    marginTop: -38,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: appTheme.green,
    borderColor: appTheme.background,
    borderRadius: 22,
    borderWidth: 4,
    height: 62,
    justifyContent: 'center',
    shadowColor: appTheme.green,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.42,
    shadowRadius: 12,
    width: 62,
  },
  item: {
    alignItems: 'center',
    gap: 5,
    minWidth: 56,
  },
  label: {
    color: '#B4C2BA',
    fontSize: 10,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.65,
  },
});
