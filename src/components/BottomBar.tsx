import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  CommonActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {CirclePlus, Home, User} from 'lucide-react-native';

import type {RootStackParamList} from '../types';

type BottomBarProps = {
  active: 'home' | 'add' | 'profile';
};

export function BottomBar({active}: BottomBarProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const items = [
    {key: 'home', label: 'Home', Icon: Home, route: 'Home'},
    {key: 'add', label: 'Add', Icon: CirclePlus, route: 'AddExpense'},
    {key: 'profile', label: 'Profile', Icon: User, route: 'Profile'},
  ] as const;

  const switchTab = (route: keyof RootStackParamList) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: route}],
      }),
    );
  };

  return (
    <View style={styles.container}>
      {items.map(({key, label, Icon, route}) => {
        const selected = active === key;

        return (
          <Pressable
            accessibilityRole="button"
            key={key}
            onPress={() => {
              if (!selected) {
                switchTab(route);
              }
            }}
            style={({pressed}) => [styles.item, pressed && styles.pressed]}>
            <Icon
              color={selected ? '#2e62dd' : '#a8b0bb'}
              fill={selected ? '#2e62dd' : 'transparent'}
              size={22}
              strokeWidth={2.4}
            />
            <Text style={[styles.label, selected && styles.activeLabel]}>
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
    paddingHorizontal: 20,
    shadowColor: '#d3d8df',
    shadowOffset: {width: 0, height: -5},
    shadowOpacity: 0.55,
    shadowRadius: 12,
  },
  item: {
    alignItems: 'center',
    gap: 5,
    minWidth: 54,
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
