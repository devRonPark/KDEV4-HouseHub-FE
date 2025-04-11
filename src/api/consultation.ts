import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  CreateConsultationReqDto,
  CreateConsultationResDto,
  ConsultationResDto,
  ConsultationType,
  ConsultationStatus,
  ConsultationListResDto,
} from '../types/consultation';
import {
  toApiConsultationDto,
  fromApiConsultationDto,
  toApiConsultationType,
  toApiStatus,
  fromApiConsultationListDto,
} from '../types/consultation';
import axios from 'axios';

/**
 * 상담 생성 API
 * @param data 상담 생성 요청 데이터
 * @returns API 응답
 */
export const createConsultation = async (
  data: CreateConsultationReqDto
): Promise<ApiResponse<CreateConsultationResDto>> => {
  try {
    // 프론트엔드 형식(소문자)에서 백엔드 형식(대문자)으로 변환
    const apiData = toApiConsultationDto(data);

    const response = await apiClient.post<ApiResponse<any>>('/consultations', apiData);

    // 백엔드 응답(대문자)을 프론트엔드 형식(소문자)으로 변환
    if (response.data.success && response.data.data) {
      response.data.data = fromApiConsultationDto(response.data.data);
    }

    return response.data as ApiResponse<CreateConsultationResDto>;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<CreateConsultationResDto>;
    }
    return {
      success: false,
      error: '상담 정보를 등록하는 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 상담 목록 조회 API
 * @returns API 응답
 */
export const getConsultationList = async (params?: {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  type?: ConsultationType;
  status?: ConsultationStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}): Promise<ApiResponse<ConsultationListResDto>> => {
  try {
    // 파라미터 변환 (소문자 -> 대문자)
    const apiParams: Record<string, any> = {};

    if (params) {
      if (params.keyword) apiParams.keyword = params.keyword;
      if (params.startDate) apiParams.startDate = params.startDate;
      if (params.endDate) apiParams.endDate = params.endDate;
      if (params.type) apiParams.type = toApiConsultationType(params.type);
      if (params.status) apiParams.status = toApiStatus(params.status);
      if (params.page !== undefined) apiParams.page = params.page;
      if (params.size !== undefined) apiParams.size = params.size;
      // 정렬 관련 파라미터 추가
      if (params.sortBy) apiParams.sortBy = params.sortBy;
      if (params.sortDirection) apiParams.sortDirection = params.sortDirection;
    }

    const response = await apiClient.get<ApiResponse<ConsultationListResDto>>('/consultations', {
      params: apiParams,
    });

    // 백엔드 응답이 성공이면, 데이터 변환
    if (response.data.success && response.data.data) {
      response.data.data = fromApiConsultationListDto(response.data.data);
    }

    return response.data as ApiResponse<ConsultationListResDto>;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<ConsultationListResDto>;
    }
    return {
      success: false,
      error: '상담 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 상담 상세 조회 API
 * @param id 상담 ID
 * @returns API 응답
 */
export const getConsultationById = async (id: number): Promise<ApiResponse<ConsultationResDto>> => {
  try {
    const response = await apiClient.get<ApiResponse<ConsultationResDto>>(`/consultations/${id}`);

    // 백엔드 응답(대문자)을 프론트엔드 형식(소문자)으로 변환
    if (response.data.success && response.data.data) {
      response.data.data = fromApiConsultationDto(response.data.data);
    }

    return response.data as ApiResponse<ConsultationResDto>;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<ConsultationResDto>;
    }
    return {
      success: false,
      error: '상담 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 상담 수정 API
 * @param id 상담 ID
 * @param data 상담 수정 요청 데이터
 * @returns API 응답
 */
export const updateConsultation = async (
  id: number,
  data: CreateConsultationReqDto
): Promise<ApiResponse<ConsultationResDto>> => {
  try {
    // 프론트엔드 형식(소문자)에서 백엔드 형식(대문자)으로 변환
    const apiData = toApiConsultationDto(data);

    const response = await apiClient.put<ApiResponse<any>>(`/consultations/${id}`, apiData);

    // 백엔드 응답(대문자)을 프론트엔드 형식(소문자)으로 변환
    if (response.data.success && response.data.data) {
      response.data.data = fromApiConsultationDto(response.data.data);
    }

    return response.data as ApiResponse<ConsultationResDto>;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<ConsultationResDto>;
    }
    return {
      success: false,
      error: '상담 정보를 수정하는 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 상담 삭제 API
 * @param id 상담 ID
 * @returns API 응답
 */
export const deleteConsultation = async (id: number): Promise<ApiResponse<ConsultationResDto>> => {
  try {
    const response = await apiClient.delete<ApiResponse<any>>(`/consultations/${id}`);

    // 백엔드 응답(대문자)을 프론트엔드 형식(소문자)으로 변환
    if (response.data.success && response.data.data) {
      response.data.data = fromApiConsultationDto(response.data.data);
    }

    return response.data as ApiResponse<ConsultationResDto>;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<ConsultationResDto>;
    }
    return {
      success: false,
      error: '상담 정보를 삭제하는 중 오류가 발생했습니다.',
    };
  }
};
