import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type { TagResDto } from '../types/tag';

// 태그 목록 조회
export const getTags = async (): Promise<ApiResponse<TagResDto[]>> => {
  try {
    const response = await apiClient.get('/crawlingTag');
    return response.data;
  } catch (error) {
    console.error('태그 목록 조회 오류:', error);
    throw error;
  }
};
