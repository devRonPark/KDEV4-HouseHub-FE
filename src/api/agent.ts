import apiClient from './client';
import type { ApiResponse } from './auth';
import type { Agent, AgentDetail } from '../types/agent';

// 현재 로그인한 에이전트 정보 조회
export const getMyProfile = async (): Promise<ApiResponse<AgentDetail>> => {
  try {
    const response = await apiClient.get<ApiResponse<AgentDetail>>('/agents/me');
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: '프로필 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
};
