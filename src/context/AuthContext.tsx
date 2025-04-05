'use client';

import type React from 'react';
import { createContext, useState, useCallback, useEffect } from 'react';
import {
  signUp as apiSignUp,
  signIn as apiSignIn,
  signOut as apiSignOut,
  checkSession,
  type SignUpRequest,
} from '../api/auth';
import { getMyProfile } from '../api/agent';
import type { AgentDetail } from '../types/agent';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AgentDetail | null;
  signUp: (data: SignUpRequest) => Promise<boolean>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  signUp: async () => false,
  signIn: async () => false,
  signOut: async () => false,
  refreshUserProfile: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true); // 초기값 true로 설정
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AgentDetail | null>(null);

  // 사용자 프로필 정보 가져오기
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await getMyProfile();
      if (response.success && response.data) {
        setUser(response.data);
        return true;
      }
      setUser(null);
      return false;
    } catch {
      setUser(null);
      return false;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await checkSession();
      if (response.success) {
        setIsAuthenticated(true);
        await fetchUserProfile();
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  // 초기 인증 상태 확인
  useEffect(() => {
    console.log('AuthProvider 마운트, 인증 상태 확인 시작');

    // 안전장치: 최대 5초 후에는 무조건 로딩 상태 해제
    const timeoutId = setTimeout(() => {
      console.log('타임아웃으로 인한 로딩 상태 해제');
      setIsLoading(false);
    }, 5000);

    checkAuth().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [checkAuth]);

  // 사용자 프로필 새로고침
  const refreshUserProfile = useCallback(async () => {
    if (isAuthenticated && !user) {
      await fetchUserProfile();
    }
  }, [isAuthenticated, user, fetchUserProfile]);

  // 회원가입
  const signUp = useCallback(async (data: SignUpRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiSignUp(data);
      return response.success;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 로그인
  const signIn = useCallback(
    async (email: string, password: string, rememberMe = false): Promise<boolean> => {
      setIsLoading(true);
      try {
        const response = await apiSignIn(email, password, rememberMe);

        if (response.success) {
          setIsAuthenticated(true);
          await fetchUserProfile();
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUserProfile]
  );

  // 로그아웃
  const signOut = useCallback(async (): Promise<boolean> => {
    try {
      // 로그아웃 API 호출
      const response = await apiSignOut();

      if (response.data?.success) {
        setIsAuthenticated(false);
        setUser(null);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        signUp,
        signIn,
        signOut,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
