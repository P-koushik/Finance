import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

import { appTheme } from '../styles/theme';

type ConfirmCardProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmCard({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onCancel,
  onConfirm,
}: ConfirmCardProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <AlertTriangle
                color={appTheme.danger}
                size={22}
                strokeWidth={2.5}
              />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={[styles.button, styles.confirmButton]}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(29, 42, 36, 0.48)',
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  button: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    height: 50,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: appTheme.greenLight,
  },
  cancelText: {
    color: appTheme.green,
    fontSize: 14,
    fontWeight: '900',
  },
  card: {
    backgroundColor: appTheme.card,
    borderColor: '#E3ECE4',
    borderRadius: 26,
    borderWidth: 1,
    elevation: 8,
    gap: 16,
    padding: 22,
    shadowColor: appTheme.greenDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    width: '100%',
  },
  confirmButton: {
    backgroundColor: appTheme.danger,
  },
  confirmText: {
    color: appTheme.card,
    fontSize: 14,
    fontWeight: '900',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 5,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: '#F8E9E5',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  message: {
    color: appTheme.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
  },
  title: {
    color: appTheme.greenDark,
    fontSize: 20,
    fontWeight: '900',
  },
});
