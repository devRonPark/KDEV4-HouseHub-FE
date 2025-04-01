'use client';

import { useState, useCallback } from 'react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  message: string; // 메시지
  variant: ToastVariant; // 토스트 종류 (success, error, warning, info)
  isVisible: boolean; // 토스트 표시 여부
}

const useToast = (duration = 3000) => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    variant: 'info',
    isVisible: false,
  });

  /**
   * 토스트 메시지를 표시하는 함수
   * @param message - 표시할 메시지
   * @param variant - 토스트 종류 (success, error, warning, info)
   * @param duration - 토스트 표시 시간 (밀리초 단위)
   * @returns void
   */
  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      setToast({ message, variant, isVisible: true });

      if (duration > 0) {
        setTimeout(() => {
          setToast((prev) => ({ ...prev, isVisible: false }));
        }, duration);
      }
    },
    [duration]
  );

  // 토스트 메시지 숨기기
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
};

export default useToast;
