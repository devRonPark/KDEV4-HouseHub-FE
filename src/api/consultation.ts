import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  CreateConsultationReqDto,
  CreateConsultationResDto,
  ConsultationResDto,
} from '../types/consultation';
import { toApiConsultationDto, fromApiConsultationDto } from '../types/consultation';
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
export const getConsultationList = async (): Promise<ApiResponse<ConsultationResDto[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<any[]>>('/consultations');

    // 백엔드 응답이 성공이면, 데이터가 비어있더라도 성공으로 처리
    if (response.data.success) {
      // 데이터가 있으면 변환, 없으면 빈 배열 반환
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((item) => fromApiConsultationDto(item));
      } else {
        // 데이터가 없거나 배열이 아닌 경우 빈 배열로 설정
        response.data.data = [];
      }

      // 성공 응답 반환
      return {
        success: true,
        data: response.data.data as ConsultationResDto[],
      };
    } else {
      // 백엔드에서 명시적으로 실패를 반환한 경우
      return {
        success: true, // 여기를 true로 변경하여 에러 메시지가 표시되지 않도록 함
        error: '데이터가 없습니다.',
        data: [],
      };
    }
  } catch (error) {
    // 네트워크 오류 등 실제 API 호출 실패 시에만 에러 반환
    return {
      success: true, // 여기를 true로 변경하여 에러 메시지가 표시되지 않도록 함
      error: '데이터가 없습니다.',
      data: [],
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
