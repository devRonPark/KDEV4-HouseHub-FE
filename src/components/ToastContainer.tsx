'use client';

import type React from 'react';
import Toast from './ui/Toast';
import useToast from '../hooks/useToast';

const ToastContainer: React.FC = () => {
  const { toast, hideToast } = useToast();

  return (
    <>
      {toast.isVisible && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={hideToast}
          isVisible={toast.isVisible}
          duration={toast.duration}
        />
      )}
    </>
  );
};

export default ToastContainer;
