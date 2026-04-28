import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Database } from 'lucide-react-native';

import { getSettings, saveSettings } from '../utils/storage';
import { useToast } from './ToastProvider';

export function StoragePermissionPrompt() {
  const { showToast } = useToast();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      setVisible(!settings.storagePermissionAsked);
    };

    loadSettings();
  }, []);

  const answerPermission = useCallback(
    async (allowed: boolean) => {
      await saveSettings({
        localStorageEnabled: allowed,
        storagePermissionAsked: true,
      });
      setVisible(false);
      showToast({
        type: allowed ? 'success' : 'info',
        title: allowed ? 'Local storage allowed' : 'Local storage disabled',
        message: allowed
          ? 'Expenses and profile details can now be saved on this device.'
          : 'You can enable local storage later from Profile settings.',
      });
    },
    [showToast],
  );

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Database color="#078f84" size={30} strokeWidth={2.6} />
          </View>
          <Text style={styles.title}>Allow Local Storage?</Text>
          <Text style={styles.message}>
            This app stores expenses, profile details, and your monthly budget
            on this device using app-private storage.
          </Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => answerPermission(false)}
              style={[styles.button, styles.denyButton]}
            >
              <Text style={styles.denyText}>Deny</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => answerPermission(true)}
              style={[styles.button, styles.allowButton]}
            >
              <Text style={styles.allowText}>Allow</Text>
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
    marginTop: 10,
  },
  allowButton: {
    backgroundColor: '#078f84',
  },
  allowText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
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
  card: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    gap: 14,
    padding: 24,
    width: '100%',
  },
  denyButton: {
    backgroundColor: '#e5e7eb',
  },
  denyText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '900',
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: '#e4f5f2',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  message: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  title: {
    color: '#1f2937',
    fontSize: 21,
    fontWeight: '900',
  },
});
