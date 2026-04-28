import React from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Eye, EyeOff, LucideIcon } from 'lucide-react-native';

type AuthInputProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  onToggleSecure?: () => void;
  secureVisible?: boolean;
} & Pick<TextInputProps, 'autoCapitalize' | 'returnKeyType'>;

export function AuthInput({
  icon: Icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry,
  onToggleSecure,
  secureVisible,
  autoCapitalize,
  returnKeyType,
}: AuthInputProps) {
  const SecureIcon = secureVisible ? EyeOff : Eye;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Icon color="#8b95a1" size={22} strokeWidth={2.4} />
        <TextInput
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9aa7ba"
          returnKeyType={returnKeyType}
          secureTextEntry={secureTextEntry}
          style={styles.input}
          value={value}
        />
        {onToggleSecure ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onToggleSecure}
          >
            <SecureIcon color="#8b95a1" size={21} strokeWidth={2.4} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 9,
  },
  input: {
    color: '#334155',
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    height: 54,
    padding: 0,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: '#eef2f6',
    borderColor: '#d1d8e3',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    height: 64,
    paddingHorizontal: 18,
  },
  label: {
    color: '#404854',
    fontSize: 15,
    fontWeight: '800',
  },
});
