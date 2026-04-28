import React from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';

type InputFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: LucideIcon;
  keyboardType?: KeyboardTypeOptions;
  prefix?: string;
} & Pick<
  TextInputProps,
  'returnKeyType' | 'onSubmitEditing' | 'autoCapitalize' | 'editable'
>;

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  icon: Icon,
  keyboardType = 'default',
  prefix,
  returnKeyType,
  onSubmitEditing,
  autoCapitalize,
  editable = true,
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Icon color="#747c88" size={21} strokeWidth={2.3} />
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#99a1ad"
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoCapitalize={autoCapitalize}
          editable={editable}
          style={[styles.input, !editable && styles.inputDisabled]}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  input: {
    color: '#2f3742',
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    height: 54,
    padding: 0,
  },
  inputDisabled: {
    color: '#8b95a1',
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: '#eef1f4',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    height: 64,
    paddingHorizontal: 18,
  },
  label: {
    color: '#686e78',
    fontSize: 16,
    fontWeight: '600',
  },
  prefix: {
    color: '#2f5f91',
    fontSize: 18,
    fontWeight: '700',
  },
});
