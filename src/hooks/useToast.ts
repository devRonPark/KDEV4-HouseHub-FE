'use client';

import { useState, useEffect, useCallback } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  message: string; // 메시지
  variant: ToastVariant; // 토스트 종류 (success, error, warning, info)
  isVisible: boolean; // 토스트 표시 여부
  duration?: number; // 토스트 표시 시간 (밀리초 단위)
}

const defaultToast: ToastState = {
  isVisible: false,
  message: '',
  variant: 'info',
  duration: 3000, // 기본 3초
};

const useToast = () => {
  const [toast, setToast] = useState<ToastState>(defaultToast);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  /**
   * 토스트 메시지를 표시하는 함수
   * @param message - 표시할 메시지
   * @param variant - 토스트 종류 (success, error, warning, info)
   * @param duration - 토스트 표시 시간 (밀리초 단위)
   * @returns void
   */
  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration = 3000) => {
      // 이미 표시 중인 토스트가 있다면 타이머 제거
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }

      // 토스트 상태 업데이트
      setToast({
        isVisible: true,
        message,
        variant,
        duration,
      });

      // 지정된 시간 후 토스트 숨기기
      const id = setTimeout(() => {
        hideToast();
      }, duration);

      setTimeoutId(id);
    },
    [timeoutId]
  );

  // 토스트 메시지 숨기기
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));

    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    toast,
    showToast,
    hideToast,
  };
};

export default useToast;
