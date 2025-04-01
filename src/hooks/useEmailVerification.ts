'use client';

import { useState, useCallback, useEffect } from 'react';
import { sendVerificationEmail, verifyEmailCode } from '../api/auth';
import { VerificationType } from '../types/auth';

declare global {
  interface Window {
    cooldownInterval?: NodeJS.Timeout;
  }
}

interface UseEmailVerificationProps {
  expirationTime?: number; // 초 단위, 기본값 180초(3분)
}

interface UseEmailVerificationReturn {
  isVerificationSent: boolean;
  isVerified: boolean;
  isLoading: boolean;
  error: string | null;
  verificationCode: string;
  timeRemaining: number;
  isExpired: boolean;
  setVerificationCode: (code: string) => void;
  sendVerification: (email: string, type: VerificationType) => Promise<boolean>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
  resendVerification: (email: string, type: VerificationType) => Promise<boolean>;
  resetVerification: () => void;
}

const useEmailVerification = ({
  expirationTime = 180,
}: UseEmailVerificationProps = {}): UseEmailVerificationReturn => {
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(expirationTime);
  const [isExpired, setIsExpired] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  // 타이머 시작 함수
  const startTimer = useCallback(
    (expiresAt: string) => {
      // 기존 타이머가 있다면 제거
      if (timerId) {
        clearInterval(timerId);
      }

      // 만료 시간 계산
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      const remainingSeconds = Math.floor((expirationDate.getTime() - now.getTime()) / 1000);

      // 이미 만료된 경우
      if (remainingSeconds <= 0) {
        setTimeRemaining(0);
        setIsExpired(true);
        return;
      }

      setTimeRemaining(remainingSeconds);
      setIsExpired(false);

      // 타이머 시작
      const id = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimerId(id);
    },
    [timerId]
  );

  // 인증 메일 발송
  const sendVerification = useCallback(
    async (email: string, type: 'SIGNUP' | 'RESET_PASSWORD'): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await sendVerificationEmail(email, type);

        if (response.success) {
          setIsVerificationSent(true);
          startTimer(response.data?.expiresAt ?? ''); // expiresAt은 서버에서 반환된 만료 시간
          return true;
        } else {
          setError(response.message || '인증 메일 발송에 실패했습니다.');
          return false;
        }
      } catch (err) {
        setError('인증 메일 발송 중 오류가 발생했습니다.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [startTimer]
  );

  // 인증 코드 확인
  const verifyCode = useCallback(
    async (email: string, code: string) => {
      if (!code) {
        setError('인증 코드를 입력해주세요.');
        return false;
      }

      if (isExpired) {
        setError('인증 시간이 만료되었습니다. 다시 시도해주세요.');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await verifyEmailCode(email, code);

        if (response.success) {
          setIsVerified(true);
          // 타이머 정리
          if (timerId) {
            clearInterval(timerId);
            setTimerId(null);
          }
          return true;
        } else {
          setError(response.error || '인증 코드가 일치하지 않습니다.');
          return false;
        }
      } catch (err) {
        setError('인증 코드 확인 중 오류가 발생했습니다.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isExpired, timerId]
  );

  // 재발송
  const resendVerification = useCallback(
    async (email: string, type: VerificationType): Promise<boolean> => {
      resetVerification();
      return await sendVerification(email, type);
    },
    [sendVerification]
  );

  // 인증 상태 초기화
  const resetVerification = useCallback(() => {
    setIsVerificationSent(false);
    setIsVerified(false);
    setError(null);
    setVerificationCode('');
    setTimeRemaining(expirationTime);
    setIsExpired(false);

    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
  }, [expirationTime, timerId]);

  return {
    isVerificationSent,
    isVerified,
    verificationCode,
    setVerificationCode,
    timeRemaining,
    isExpired,
    isLoading,
    error,
    sendVerification,
    verifyCode,
    resetVerification,
    resendVerification,
  };
};

export default useEmailVerification;
