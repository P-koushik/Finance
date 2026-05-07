import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  Text,
  ViewStyle,
} from 'react-native';
import { CircleCheck } from 'lucide-react-native';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  className,
  style,
}: PrimaryButtonProps) {
  const buttonClassName = [
    'h-[54px] flex-row items-center justify-center gap-2.5 rounded-[32px] bg-[#124777] shadow-lg shadow-[#0a2d4c]',
    className,
    disabled || loading ? 'opacity-[0.58]' : 'active:opacity-[0.88]',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Pressable
      accessibilityRole="button"
      className={buttonClassName}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        style,
        pressed && !disabled && !loading
          ? { transform: [{ scale: 0.99 }] }
          : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <>
          <CircleCheck color="#ffffff" size={20} strokeWidth={2.6} />
          <Text className="text-[15px] font-bold text-white">{label}</Text>
        </>
      )}
    </Pressable>
  );
}
