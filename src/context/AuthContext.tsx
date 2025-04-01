'use client';

import type React from 'react';
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, AuthState, SignUpFormData } from '../types/auth';

interface AuthContextType extends AuthState {
  // signIn: (email: string, password: string) => Promise<boolean>;
  // signOut: () => void;
  signUp: (userData: SignUpFormData) => Promise<boolean>;
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

  const signUp = async (userData: SignUpFormData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 실제 구현에서는 API 호출
      // 임시 구현: 성공 응답
      const mockUser: User = {
        id: '2',
        email: userData.email,
        name: userData.name,
        role: 'agent',
        phone: userData.phone,
        licenseNumber: userData.licenseNumber,
        agencyName: userData.agencyName,
        agencyBusinessNumber: userData.agencyBusinessNumber,
        agencyAddress: userData.agencyAddress,
        agencyRoadAddress: userData.agencyRoadAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 실제 구현에서는 회원가입 후 자동 로그인하지 않을 수 있음
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('회원가입 오류:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: '회원가입 중 오류가 발생했습니다.',
      }));
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
