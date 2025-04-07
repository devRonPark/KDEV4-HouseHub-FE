'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'react-feather';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
  isVisible?: boolean;
}

const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  onClose,
  isVisible = true,
  duration = 3000,
}) => {
  const [isShowing, setIsShowing] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      // Auto-close the toast after the specified duration
      const autoCloseTimer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(autoCloseTimer);
    } else {
      // 애니메이션을 위한 지연
      const timer = setTimeout(() => {
        setIsShowing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isShowing && !isVisible) return null;

  // 토스트 아이콘 선택
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // 토스트 배경색 선택
  const getBgColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg border ${getBgColor()} max-w-md`}
        role="alert"
      >
        <div className="flex-shrink-0 mr-3">{getIcon()}</div>
        <div className="flex-1 mr-2">
          <p className="text-sm font-medium text-gray-800">{message}</p>
        </div>
        <button
          type="button"
          className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={onClose}
          aria-label="닫기"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
