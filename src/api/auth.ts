import { VerificationType } from '../types/auth';
import apiClient from './client';
import axios from 'axios';
import { ApiResponse } from '../types/api';

// 이메일 인증 관련 타입
export interface SendVerificationEmailRequest {
  email: string;
  type: VerificationType;
}

export interface SendVerificationEmailResponse {
  expiresAt: string; // ISO 형식의 만료 시간
}

/**
 * 이메일 인증 코드 전송 요청
 * @param email - 인증을 받을 이메일 주소
 * @param code - 인증 코드
 * @returns {Promise<ApiResponse>} - API 응답
 */
export interface VerifyEmailCodeRequest {
  email: string;
  code: string;
}

/**
 * 회원가입 요청
 */
export interface SignUpRequest {
  agent: {
    name: string;
    licenseNumber?: string;
    email: string;
    password: string;
    contact: string;
    emailVerified: boolean;
  };
  realEstate?: {
    name?: string;
    businessRegistrationNumber?: string;
    address?: string;
    roadAddress?: string;
    contact?: string;
  };
}

// 인증 메일 발송 API
export const sendVerificationEmail = async (
  email: string,
  type: VerificationType
): Promise<ApiResponse<SendVerificationEmailResponse>> => {
  try {
    const response = await apiClient.post<ApiResponse<SendVerificationEmailResponse>>(
      '/auth/email/send',
      { email, type }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse;
    }
    return {
      success: false,
      error: '인증 메일 발송 중 오류가 발생했습니다.',
    };
  }
};

// 인증 코드 확인 API
export const verifyEmailCode = async (email: string, code: string): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>('/auth/email/verify', { email, code });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse;
    }
    return {
      success: false,
      error: '인증 코드 확인 중 오류가 발생했습니다.',
    };
  }
};

// 회원가입 API
export const signUp = async (userData: SignUpRequest): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>('/auth/signup', userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse;
    }
    return {
      success: false,
      error: '회원가입 중 오류가 발생했습니다.',
    };
  }
};

// 세션 확인 API
export const checkSession = async (): Promise<ApiResponse> => {
  try {
    const response = await apiClient.get<ApiResponse>('/auth/session');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse;
    }
    return {
      success: false,
      error: '세션 확인 중 오류가 발생했습니다.',
    };
  }
};

// 로그인 API (자동 로그인 옵션 추가)
export const signIn = async (
  email: string,
  password: string,
  rememberMe = false
): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>('/auth/signin', {
      email,
      password,
      rememberMe, // 자동 로그인 옵션 추가
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse;
    }
    return {
      success: false,
      error: '로그인 중 오류가 발생했습니다.',
    };
  }
};

// 로그아웃 API
export const signOut = async (): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>('/auth/logout');
    alert(JSON.stringify(response));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse;
    }
    return {
      success: false,
      error: '로그아웃 중 오류가 발생했습니다.',
    };
  }
};
