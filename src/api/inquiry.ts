import apiClient from './client';
import type {
  InquiryTemplate,
  CreateInquiryResponse,
  CreateInquiryRequest,
  InquiryDetail,
  InquiryListResponse,
  InquiryFilter,
} from '../types/inquiry';
import { isAxiosError } from 'axios';
import { ApiResponse } from '../types/api';

// 템플릿 조회 API
export const getPublicInquiryTemplate = async (shareToken: string): Promise<InquiryTemplate> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: InquiryTemplate;
      message?: string;
    }>(`/inquiry-templates/share/${shareToken}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || '템플릿을 불러오는데 실패했습니다.');
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('유효하지 않은 공유 링크입니다.');
    }
    throw new Error(error.message || '템플릿을 불러오는 중 오류가 발생했습니다.');
  }
};

// 문의 등록 API
export const createInquiry = async (
  data: CreateInquiryRequest
): Promise<ApiResponse<CreateInquiryResponse>> => {
  try {
    const response = await apiClient.post<ApiResponse<CreateInquiryResponse>>('/inquiries', data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data) {
      return error.response.data as ApiResponse<CreateInquiryResponse>;
    }

    // 기본 에러 응답 형식
    return {
      success: false,
      message: '문의 등록 중 오류가 발생했습니다.',
      code: 'UNKNOWN_ERROR',
    };
  }
};

// 문의 목록 조회 API
export const getInquiries = async (
  filter: InquiryFilter
): Promise<ApiResponse<InquiryListResponse>> => {
  try {
    const params = new URLSearchParams();
    if (filter.keyword) params.append('keyword', filter.keyword);
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortDirection) params.append('sortDirection', filter.sortDirection);
    params.append('page', filter.page.toString());
    params.append('size', filter.size.toString());

    const response = await apiClient.get<ApiResponse<InquiryListResponse>>(
      `/inquiries?${params.toString()}`
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: '문의 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 문의 상세 조회 API
export const getInquiryById = async (inquiryId: number): Promise<ApiResponse<InquiryDetail>> => {
  try {
    const response = await apiClient.get<ApiResponse<InquiryDetail>>(`/inquiries/${inquiryId}`);
    return response.data;
  } catch {
    return {
      success: false,
      error: '문의 상세 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
};
