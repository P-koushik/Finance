import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CircleCheck, CircleX, Info, X } from 'lucide-react-native';

type MessageType = 'error' | 'success' | 'info';

type MessageCardProps = {
  title: string;
  message: string;
  type?: MessageType;
  onDismiss?: () => void;
};

const colors = {
  error: { bg: '#fff1f2', border: '#fecdd3', icon: '#e11d48' },
  success: { bg: '#ecfdf5', border: '#bbf7d0', icon: '#059669' },
  info: { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb' },
};

export function MessageCard({
  title,
  message,
  type = 'info',
  onDismiss,
}: MessageCardProps) {
  const Icon =
    type === 'success' ? CircleCheck : type === 'error' ? CircleX : Info;
  const color = colors[type];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: color.bg, borderColor: color.border },
      ]}
    >
      <Icon color={color.icon} size={22} strokeWidth={2.5} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {onDismiss ? (
        <Pressable
          accessibilityLabel="Dismiss message"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onDismiss}
        >
          <X color="#64748b" size={18} strokeWidth={2.4} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  message: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  title: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '900',
  },
});
