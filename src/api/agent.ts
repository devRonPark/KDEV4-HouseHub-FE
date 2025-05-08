import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type { AgentDetail, UpdateAgentReqDto } from '../types/agent';
import axios from 'axios';

// 현재 로그인한 에이전트 정보 조회
export const getMyProfile = async (): Promise<ApiResponse<AgentDetail>> => {
  try {
    const response = await apiClient.get<ApiResponse<AgentDetail>>('/agents/me');
    return response.data;
  } catch {
    return {
      success: false,
      error: '프로필 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
};

export const updateMyProfile = async (
  agentData: UpdateAgentReqDto
): Promise<ApiResponse<AgentDetail>> => {
  try {
    const response = await apiClient.put<ApiResponse<AgentDetail>>('/agents/me', agentData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<AgentDetail>;
    }
    return {
      success: false,
      error: '프로필 정보를 수정하던 중 오류가 발생했습니다.',
    };
  }
};
