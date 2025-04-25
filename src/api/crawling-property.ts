import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  CrawlingPropertySearchParams,
  CrawlingPropertyListResponse,
  CrawlingPropertyItem,
} from '../types/crawling-property';

// 크롤링 매물 목록 조회 API
export const getCrawlingProperties = async (
  params: CrawlingPropertySearchParams
): Promise<ApiResponse<CrawlingPropertyListResponse>> => {
  try {
    const response = await apiClient.get<ApiResponse<CrawlingPropertyListResponse>>(
      '/crawlingProperties',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Crawling Property API error:', error);
    return {
      success: false,
      error: '크롤링 매물 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 크롤링 매물 상세 조회 API
export const getCrawlingPropertyById = async (
  id: string
): Promise<ApiResponse<CrawlingPropertyItem>> => {
  try {
    const response = await apiClient.get<ApiResponse<CrawlingPropertyItem>>(
      `/crawlingProperties/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching crawling property details:', error);
    return {
      success: false,
      error: '크롤링 매물 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
};

export const searchCrawlingProperties = async (
  params: CrawlingPropertySearchParams
): Promise<ApiResponse<CrawlingPropertyListResponse>> => {
  try {
    const response = await apiClient.get<ApiResponse<CrawlingPropertyListResponse>>(
      '/crawlingProperties',
      { params }
    );
    return response.data as ApiResponse<CrawlingPropertyListResponse>;
  } catch (error) {
    console.error('Failed to search crawling properties:', error);
    return {
      success: false,
      data: undefined,
      error: '매물 검색 중 오류가 발생했습니다.'
    };
  }
}; 