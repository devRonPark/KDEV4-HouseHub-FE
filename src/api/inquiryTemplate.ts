import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  InquiryTemplate,
  InquiryTemplateListResponse,
  InquiryTemplateRequest,
  InquiryTemplateFilter,
} from '../types/inquiryTemplate';

// 문의 템플릿 목록 조회 API
export const getInquiryTemplates = async (
  filter: InquiryTemplateFilter
): Promise<ApiResponse<InquiryTemplateListResponse>> => {
  try {
    const params = new URLSearchParams();
    if (filter.isActive !== undefined) params.append('isActive', filter.isActive.toString());
    if (filter.keyword !== undefined) params.append('keyword', filter.keyword);
    params.append('page', filter.page.toString());

    const response = await apiClient.get<ApiResponse<InquiryTemplateListResponse>>(
      `/inquiry-templates?${params.toString()}`
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: '문의 템플릿 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 문의 템플릿 상세 조회 API
export const getInquiryTemplateById = async (id: string): Promise<ApiResponse<InquiryTemplate>> => {
  try {
    const response = await apiClient.get<ApiResponse<InquiryTemplate>>(
      `/inquiry-templates/${id}/preview`
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: '문의 템플릿 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 문의 템플릿 생성 API
export const createInquiryTemplate = async (
  data: InquiryTemplateRequest
): Promise<ApiResponse<InquiryTemplate>> => {
  try {
    const response = await apiClient.post<ApiResponse<InquiryTemplate>>('/inquiry-templates', data);
    return response.data;
  } catch {
    return {
      success: false,
      error: '문의 템플릿 생성 중 오류가 발생했습니다.',
    };
  }
};

// 문의 템플릿 수정 API
export const updateInquiryTemplate = async (
  id: string,
  data: Partial<InquiryTemplateRequest>
): Promise<ApiResponse<InquiryTemplate>> => {
  try {
    const response = await apiClient.put<ApiResponse<InquiryTemplate>>(
      `/inquiry-templates/${id}`,
      data
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: '문의 템플릿 수정 중 오류가 발생했습니다.',
    };
  }
};

// 문의 템플릿 삭제 API
export const deleteInquiryTemplate = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(`/inquiry-templates/${id}`);
    return response.data;
  } catch {
    return {
      success: false,
      error: '문의 템플릿 삭제 중 오류가 발생했습니다.',
    };
  }
};
