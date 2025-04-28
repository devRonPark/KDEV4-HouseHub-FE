import { ApiResponse } from '../types/api';
import type { RegionItem } from '../types/region';
import apiClient from './client';

/**
 * 도/특별시/광역시 목록을 가져오는 함수
 */
export async function fetchProvinces(): Promise<ApiResponse<RegionItem[]>> {
  try {
    const response = await apiClient.get('/regions/provinces');
    return response.data || [];
  } catch (error) {
    console.error('도/특별시/광역시 목록 조회 실패:', error);
    // 에러 발생 시 에러를 전파하여 UI에서 적절히 처리
    throw error;
  }
}

/**
 * 특정 도/특별시/광역시의 시/군/구 목록을 가져오는 함수
 */
export async function fetchCities(province: string): Promise<ApiResponse<RegionItem[]>> {
  try {
    const response = await apiClient.get('/regions/cities', {
      params: { province },
    });
    return response.data || [];
  } catch (error) {
    console.error(`${province}의 시/군/구 목록 조회 실패:`, error);
    throw error;
  }
}

/**
 * 특정 시/군/구의 읍/면/동 목록을 가져오는 함수
 */
export async function fetchDongs(
  province: string,
  city: string
): Promise<ApiResponse<RegionItem[]>> {
  try {
    const response = await apiClient.get('/regions/dongs', {
      params: { province, city },
    });
    return response.data || [];
  } catch (error) {
    console.error(`${province} ${city}의 읍/면/동 목록 조회 실패:`, error);
    throw error;
  }
}
