import apiClient from './client';
import type { ApiResponse } from '../types/api';
import { CrawlingTagResDto } from '../types/crawling-tag';

export const getCrawlingTags = async (
): Promise<ApiResponse<CrawlingTagResDto[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<CrawlingTagResDto[]>>(
      '/crawlingTag',
    );
    return response.data;
  } catch (error) {
    console.error('Crawling Tag API error:', error);
    return {
      success: false,
      error: '태그 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};