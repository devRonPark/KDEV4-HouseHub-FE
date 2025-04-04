'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthState } from '../types/auth';
import {
  signUp as apiSignUp,
  signIn as apiSignIn,
  type SignUpRequest,
  checkSession,
} from '../api/auth';
import apiClient from '../api/client';
import { AgentDetail } from '../types/agent';
import { getMyProfile } from '../api/agent';

interface AuthContextType extends AuthState {
  signUp: (data: SignUpRequest) => Promise<boolean>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  signUp: async () => false,
  signIn: async () => false,
  signOut: async () => false,
  refreshUserProfile: async () => {},
});

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AgentDetail | null>(null);

  // 사용자 프로필 정보 가져오기
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await getMyProfile();
      if (response.success && response.data) {
        setUser(response.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return false;
    }
  }, []);

  // 초기 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 현재 경로 확인
        const currentPath = window.location.pathname;
        const publicPaths = ['/signin', '/signup'];
        // 공개 라우트인 경우 인증 검증 건너뜀
        if (publicPaths.includes(currentPath)) {
          setIsLoading(false);
          return;
        }

        // 세션 상태 확인 API 호출
        const response = await checkSession();
        if (response.success && response.data.authenticated) {
          setIsAuthenticated(response.data.authenticated);
          await fetchUserProfile();
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        // 인증되지 않은 상태
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [fetchUserProfile]);

  // 사용자 프로필 새로고침
  const refreshUserProfile = useCallback(async () => {
    if (isAuthenticated) {
      await fetchUserProfile();
    }
  }, [isAuthenticated, fetchUserProfile]);

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
  const signIn = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiSignIn(email, password, rememberMe);

      if (response.success) {
        setIsAuthenticated(true);
        await fetchUserProfile();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const logout = useCallback(async (): Promise<boolean> => {
    try {
      // 로그아웃 API 호출
      const response = await apiClient.post('/auth/logout');

      if (response.data.success) {
        setIsAuthenticated(false);
        setUser(null);
        return true;
      }
      return false;
    } catch (error) {
      return false;
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
        signOut: logout,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
