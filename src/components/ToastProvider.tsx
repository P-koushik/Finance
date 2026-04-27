import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {MessageCard} from './MessageCard';

type ToastType = 'error' | 'success' | 'info';

type Toast = {
  id: number;
  title: string;
  message: string;
  type: ToastType;
};

type ToastInput = Omit<Toast, 'id'>;

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({children}: {children: ReactNode}) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<Toast | null>(null);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((nextToast: ToastInput) => {
    setToast({
      ...nextToast,
      id: Date.now(),
    });
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = setTimeout(dismissToast, 3500);
    return () => clearTimeout(timeout);
  }, [dismissToast, toast]);

  const value = useMemo(() => ({showToast}), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View
          pointerEvents="box-none"
          style={[styles.toastWrap, {top: insets.top + 12}]}>
          <MessageCard
            message={toast.message}
            onDismiss={dismissToast}
            title={toast.title}
            type={toast.type}
          />
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  toastWrap: {
    left: 16,
    position: 'absolute',
    right: 16,
    zIndex: 1000,
  },
});
