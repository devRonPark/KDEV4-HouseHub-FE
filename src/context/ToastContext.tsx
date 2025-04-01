'use client';

import type React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Toast from '../components/ui/Toast';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  isVisible: boolean;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextType {
  toast: ToastState;
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  hideToast: () => void;
}

const defaultToast: ToastState = {
  isVisible: false,
  message: '',
  variant: 'info',
  duration: 3000,
};

const ToastContext = createContext<ToastContextType>({
  toast: defaultToast,
  showToast: () => {},
  hideToast: () => {},
});

export const useToast = () => useContext(ToastContext);

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>(defaultToast);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration = 3000) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }

      setToast({
        isVisible: true,
        message,
        variant,
        duration,
      });

      const id = setTimeout(() => {
        hideToast();
      }, duration);

      setTimeoutId(id);
    },
    [timeoutId]
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));

    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
      {toast.isVisible && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={hideToast}
          isVisible={toast.isVisible}
          duration={toast.duration}
        />
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
