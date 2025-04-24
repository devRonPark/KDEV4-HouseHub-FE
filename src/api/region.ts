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

/**
 * 지역명으로 검색하는 함수 (추가 기능)
 */
export async function searchRegions(keyword: string): Promise<RegionItem[]> {
  try {
    const response = await apiClient.get('/region/search', {
      params: { keyword },
    });
    return response.data.results || [];
  } catch (error) {
    console.error(`지역 검색 실패 (키워드: ${keyword}):`, error);
    throw error;
  }
}

/**
 * 지역 데이터 캐싱을 위한 간단한 캐시 구현
 */
export class RegionCache {
  private static instance: RegionCache;
  private cache: Map<string, { data: any; timestamp: number }>;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): RegionCache {
    if (!RegionCache.instance) {
      RegionCache.instance = new RegionCache();
    }
    return RegionCache.instance;
  }

  // 캐시에서 데이터 가져오기
  public get<T>(key: string, maxAge = 3600000): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // 캐시 유효 기간 확인 (기본 1시간)
    if (Date.now() - cached.timestamp > maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  // 캐시에 데이터 저장
  public set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // 캐시 삭제
  public delete(key: string): void {
    this.cache.delete(key);
  }

  // 캐시 전체 삭제
  public clear(): void {
    this.cache.clear();
  }
}

// 캐싱된 API 호출 함수들
export async function fetchProvincesWithCache(): Promise<RegionItem[]> {
  const cache = RegionCache.getInstance();
  const cacheKey = 'provinces';

  // 캐시에서 데이터 확인
  const cachedData = cache.get<RegionItem[]>(cacheKey);
  if (cachedData) return cachedData;

  // 캐시에 없으면 API 호출
  const data = await fetchProvinces();
  cache.set(cacheKey, data);
  return data;
}

export async function fetchCitiesWithCache(province: string): Promise<RegionItem[]> {
  const cache = RegionCache.getInstance();
  const cacheKey = `cities:${province}`;

  const cachedData = cache.get<RegionItem[]>(cacheKey);
  if (cachedData) return cachedData;

  const data = await fetchCities(province);
  cache.set(cacheKey, data);
  return data;
}

export async function fetchDongsWithCache(province: string, city: string): Promise<RegionItem[]> {
  const cache = RegionCache.getInstance();
  const cacheKey = `dongs:${province}:${city}`;

  const cachedData = cache.get<RegionItem[]>(cacheKey);
  if (cachedData) return cachedData;

  const data = await fetchDongs(province, city);
  cache.set(cacheKey, data);
  return data;
}
