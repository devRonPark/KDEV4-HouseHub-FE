import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  CrawlingPropertySearchParams,
  CrawlingPropertyListResponse,
  CrawlingPropertyResDto,
} from '../types/crawling-property';

//크롤링 매물 목록 조회 API
export const searchCrawlingPropertiesWithTags = async (
  params: CrawlingPropertySearchParams
): Promise<ApiResponse<CrawlingPropertyListResponse>> => {
  try {
    const response = await apiClient.get<ApiResponse<CrawlingPropertyListResponse>>(
      '/crawlingProperties',
      {
        params,
        paramsSerializer: {
          serialize: (params) => {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (value === undefined || value === null) {
                return; // undefined나 null 값은 제외
              }
              if (Array.isArray(value)) {
                value.forEach((item) => {
                  if (item !== undefined && item !== null) {
                    searchParams.append(key, item.toString());
                  }
                });
              } else {
                searchParams.append(key, value.toString());
              }
            });
            return searchParams.toString();
          },
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to search crawling properties with tags:', error);
    return {
      success: false,
      data: undefined,
      error: '매물 검색 중 오류가 발생했습니다.',
    };
  }
};

// 크롤링 매물 상세 조회 API
export const getCrawlingPropertyById = async (
  id: string
): Promise<ApiResponse<CrawlingPropertyResDto>> => {
  try {
    const response = await apiClient.get<ApiResponse<CrawlingPropertyResDto>>(
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
