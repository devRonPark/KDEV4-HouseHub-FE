import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  PropertyRegistrationDTO,
  PropertyListResponse,
  PropertySearchFilter,
  FindPropertyDetailResDto, // Added import
  PropertyType,
} from '../types/property';
import { isAxiosError } from 'axios';

export interface PropertyReqDto {
  propertyType: PropertyType;
  roadAddress: string;
  jibunAddress: string;
  detailAddress: string;
  memo?: string;
}

// 매물 등록 API
export const registerProperty = async (
  propertyData: PropertyRegistrationDTO
): Promise<ApiResponse<{ id: number }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ id: number }>>('/properties', propertyData);
    return response.data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: '매물 등록 중 오류가 발생했습니다.',
    };
  }
};

// 매물 목록 조회 API
export const getProperties = async (
  filter: PropertySearchFilter
): Promise<ApiResponse<PropertyListResponse>> => {
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

    const response = await apiClient.get<ApiResponse<PropertyListResponse>>(url);

    // 응답 구조 로깅
    console.log('API Response:', response.data);

    // // 응답 구조가 예상과 다를 경우 안전하게 처리
    // if (response.data.success) {
    //   // 응답 데이터가 직접 배열인 경우
    //   if (Array.isArray(response.data.data)) {
    //     return {
    //       success: true,
    //       data: {
    //         properties: response.data.data,
    //         totalPages: 1, // 기본값
    //         totalElements: response.data.data.length,
    //         currentPage: filter.page,
    //         size: filter.size,
    //       },
    //     };
    //   }
    //   // 응답이 예상한 구조인 경우
    //   else if (response.data.data && response.data.data.properties) {
    //     return response.data;
    //   }
    //   // 다른 구조인 경우
    //   else {
    //     return {
    //       success: true,
    //       data: {
    //         properties: Array.isArray(response.data.data)
    //           ? response.data.data
    //           : response.data.data?.properties || [],
    //         totalPages: response.data.data?.totalPages || 1,
    //         totalElements: response.data.data?.totalElements || 0,
    //         currentPage: filter.page,
    //         size: filter.size,
    //       },
    //     };
    //   }
    // }

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
    console.log('Property detail response:', response.data);
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
  data: PropertyReqDto
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
