import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  CreateConsultationReqDto,
  CreateConsultationResDto,
  ConsultationResDto,
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
    console.log('API 요청 데이터:', data); // 디버깅용 로그 추가

    const response = await apiClient.post<ApiResponse<CreateConsultationResDto>>(
      '/consultations',
      data
    );
    return response.data;
  } catch (error) {
    console.error('상담 생성 API 오류:', error); // 디버깅용 로그 추가
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
export const getConsultationList = async (): Promise<ApiResponse<ConsultationResDto[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<ConsultationResDto[]>>('/consultations');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<ConsultationResDto[]>;
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
    console.log(`상담 상세 조회 API 호출: /consultations/${id}`); // 디버깅용 로그 추가
    const response = await apiClient.get<ApiResponse<ConsultationResDto>>(`/consultations/${id}`);
    console.log('API 응답:', response.data); // 디버깅용 로그 추가
    return response.data;
  } catch (error) {
    console.error('상담 상세 조회 API 오류:', error); // 디버깅용 로그 추가
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
    console.log('API 수정 요청 데이터:', data); // 디버깅용 로그 추가

    const response = await apiClient.put<ApiResponse<ConsultationResDto>>(
      `/consultations/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('상담 수정 API 오류:', error); // 디버깅용 로그 추가
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
    const response = await apiClient.delete<ApiResponse<ConsultationResDto>>(
      `/consultations/${id}`
    );
    return response.data;
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
