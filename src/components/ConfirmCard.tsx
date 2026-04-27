import React from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';

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
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={[styles.button, styles.cancelButton]}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={[styles.button, styles.confirmButton]}>
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
    gap: 12,
    marginTop: 8,
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  button: {
    alignItems: 'center',
    borderRadius: 24,
    flex: 1,
    height: 48,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
  },
  cancelText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    gap: 12,
    padding: 22,
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#be123c',
  },
  confirmText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  message: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  title: {
    color: '#1f2937',
    fontSize: 20,
    fontWeight: '900',
  },
});
