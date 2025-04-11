import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  PropertyRegistrationDTO,
  PropertyListResDto,
  PropertySearchFilter,
  FindPropertyDetailResDto, // Added import
} from '../types/property';
import { isAxiosError } from 'axios';

// 매물 등록 API
export const registerProperty = async (
  propertyData: PropertyRegistrationDTO
): Promise<ApiResponse<{ id: number }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ id: number }>>('/properties', propertyData);
    return response.data;
  } catch {
    return {
      success: false,
      error: '매물 등록 중 오류가 발생했습니다.',
    };
  }
};

// 매물 목록 조회 API
export const getProperties = async (
  filter: PropertySearchFilter
): Promise<ApiResponse<PropertyListResDto>> => {
  try {
    let url = `/properties?page=${filter.page}&size=${filter.size}`;

    // 각 필터 파라미터 추가
    if (filter.province) {
      url += `&province=${encodeURIComponent(filter.province)}`;
    }

    if (filter.city) {
      url += `&city=${encodeURIComponent(filter.city)}`;
    }

    if (filter.dong) {
      url += `&dong=${encodeURIComponent(filter.dong)}`;
    }

    if (filter.propertyType) {
      url += `&propertyType=${filter.propertyType}`;
    }

    if (filter.agentName) {
      url += `&agentName=${encodeURIComponent(filter.agentName)}`;
    }

    if (filter.customerName) {
      url += `&customerName=${encodeURIComponent(filter.customerName)}`;
    }

    if (filter.active !== undefined) {
      url += `&active=${filter.active}`;
    }

    const response = await apiClient.get<ApiResponse<PropertyListResDto>>(url);

    // 응답 구조 로깅
    // console.log('API Response:', response.data);

    return response.data;
  } catch (error) {
    console.error('Property API error:', error);
    return {
      success: false,
      error: '매물 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 매물 상세 조회 API 수정
export const getPropertyById = async (
  id: number
): Promise<ApiResponse<FindPropertyDetailResDto>> => {
  try {
    const response = await apiClient.get<ApiResponse<FindPropertyDetailResDto>>(
      `/properties/${id}`
    );
    // console.log('Property detail response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching property details:', error);
    return {
      success: false,
      error: '매물 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 매물 삭제 API
export const deleteProperty = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(`/properties/${id}`);
    return response.data;
  } catch {
    return {
      success: false,
      error: '매물 삭제 중 오류가 발생했습니다.',
    };
  }
};

export const updateProperty = async (
  id: number,
  data: PropertyRegistrationDTO
): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.put(`/properties/${id}`, data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};
