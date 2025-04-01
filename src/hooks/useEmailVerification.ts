'use client';

import { useState, useCallback, useEffect } from 'react';

declare global {
  interface Window {
    cooldownInterval?: NodeJS.Timeout;
  }
}

interface UseEmailVerificationProps {
  /**
   * 인증 메일 발송 함수
   * @param email - 인증을 받을 이메일 주소
   * @returns Promise<boolean> - 인증 메일 발송 성공 여부
   * @description 인증 메일 발송 후 성공 시 true, 실패 시 false를 반환합니다.
   */
  onSendVerification: (email: string) => Promise<boolean>;
  /**
   * 인증 코드 확인 함수
   * @param email - 인증을 받을 이메일 주소
   * @param code - 인증 코드
   * @returns Promise<boolean> - 인증 코드 확인 성공 여부
   * @description 인증 코드 확인 후 성공 시 true, 실패 시 false를 반환합니다.
   */
  onVerifyCode: (email: string, code: string) => Promise<boolean>;
  expirationTime?: number; // 초 단위, 기본값 180초(3분)
}

const useEmailVerification = ({
  onSendVerification,
  onVerifyCode,
  expirationTime = 180,
}: UseEmailVerificationProps) => {
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(expirationTime);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 타이머 관리
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isVerificationSent && !isVerified && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            if (timer) clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isVerificationSent, isVerified, timeRemaining]);

  // 인증 메일 발송
  const sendVerification = useCallback(
    async (email: string) => {
      setError(null);
      setIsLoading(true);

      try {
        const success = await onSendVerification(email);

        if (success) {
          setIsVerificationSent(true);
          setTimeRemaining(expirationTime);
          setIsExpired(false);
          return true;
        } else {
          setError('인증 메일 발송에 실패했습니다.');
          return false;
        }
      } catch (err) {
        setError('인증 메일 발송 중 오류가 발생했습니다.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [onSendVerification, expirationTime]
  );

  // 인증 코드 확인
  const verifyCode = useCallback(
    async (email: string, code: string) => {
      if (isExpired) {
        setError('인증 시간이 만료되었습니다. 다시 시도해주세요.');
        return false;
      }

      setError(null);
      setIsLoading(true);

      try {
        const success = await onVerifyCode(email, code);

        if (success) {
          setIsVerified(true);
          return true;
        } else {
          setError('인증 코드가 일치하지 않습니다.');
          return false;
        }
      } catch (err) {
        setError('인증 코드 확인 중 오류가 발생했습니다.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [onVerifyCode, isExpired]
  );

  // 인증 프로세스 리셋
  const resetVerification = useCallback(() => {
    setIsVerificationSent(false);
    setIsVerified(false);
    setVerificationCode('');
    setTimeRemaining(expirationTime);
    setIsExpired(false);
    setError(null);
  }, [expirationTime]);

  // 재발송
  const resendVerification = useCallback(
    async (email: string) => {
      resetVerification();
      return sendVerification(email);
    },
    [resetVerification, sendVerification]
  );

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
