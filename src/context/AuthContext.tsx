'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthState } from '../types/auth';
import { signUp as apiSignUp, type SignUpRequest } from '../api/auth';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<boolean>;
  // signOut: () => void;
  signUp: (userData: SignUpRequest) => Promise<boolean>;
  // resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 는 반드시 AuthProvider 내부에서 사용해야 합니다.');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
          // 실제 구현에서는 토큰 유효성 검증 필요
          setAuthState({
            user: JSON.parse(storedUser),
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: '인증 상태 확인 중 오류가 발생했습니다.',
        });
      }
    };

    checkAuth();
  }, []);

  // 회원가입
  const signUp = useCallback(async (data: SignUpRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiSignUp(data);
      setIsLoading(false);
      return response.success;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  }, []);

  // 로그인
  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 실제 구현에서는 API 호출
      // 임시 구현: 테스트 계정으로 로그인
      if (email === 'test@example.com' && password === 'password') {
        const mockUser: User = {
          id: '1',
          email: 'test@example.com',
          name: '김부동',
          role: 'realtor',
          phone: '010-1234-5678',
          licenseNumber: '12345-67890',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const mockToken = 'mock-jwt-token';

        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', mockToken);

        setAuthState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      } else {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: '이메일 또는 비밀번호를 확인하세요.',
        }));
        return false;
      }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: '로그인 중 오류가 발생했습니다.',
      }));
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signUp,
        signIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
