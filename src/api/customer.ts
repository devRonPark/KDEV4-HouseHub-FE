import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  CustomerResDto,
  CreateCustomerReqDto,
  CustomerListResDto,
  CustomerSearchFilter,
  Customer,
} from '../types/customer';
import axios from 'axios';
import { ConsultationListResDto } from '../types/consultation';
import { ContractListResDto } from '../types/contract';
import { InquiryListResponse } from '../types/inquiry';
import { SmsListResDto } from '../types/sms';
import { FindPropertyResDto } from '../types/property';
import { CrawlingPropertyResDto } from '../types/crawling-property';

// 현재 로그인한 에이전트의 고객 리스트 조회 (상담 내역 제외)
export const getMyCustomers = async (
  filter: CustomerSearchFilter
): Promise<ApiResponse<CustomerListResDto>> => {
  try {
    let url = `/customers?page=${filter.page}&size=${filter.size}`;
    if (filter.keyword) {
      url += `&keyword=${encodeURIComponent(filter.keyword)}`;
    }
    if (filter.includeDeleted !== undefined) {
      url += `&includeDeleted=${filter.includeDeleted}`;
    }
    const response = await apiClient.get<ApiResponse<CustomerListResDto>>(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<CustomerListResDto>;
    }

    return {
      success: false,
      error: `고객 정보를 불러오는 중 오류가 발생했습니다.`,
    };
  }
};

// 현재 로그인한 에이전트의 신규 고객 추가
export const createMyCustomer = async (
  customerData: CreateCustomerReqDto
): Promise<ApiResponse<CustomerResDto>> => {
  try {
    const response = await apiClient.post<ApiResponse<CustomerResDto>>('/customers', customerData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<CustomerResDto>;
    }
    return {
      success: false,
      error: '고객 정보를 등록하는 중 오류가 발생했습니다',
    };
  }
};

export const updateMyCustomer = async (
  id: number,
  customerData: CreateCustomerReqDto
): Promise<ApiResponse<CustomerResDto>> => {
  try {
    const response = await apiClient.put<ApiResponse<CustomerResDto>>(
      `/customers/${id}`,
      customerData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<CustomerResDto>;
    }
    return {
      success: false,
      error: '고객 정보를 수정하는 중 오류가 발생했습니다.',
    };
  }
};

export const deleteMyCustomer = async (id: number): Promise<ApiResponse<CustomerResDto>> => {
  try {
    const response = await apiClient.delete<ApiResponse<CustomerResDto>>(`/customers/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<CustomerResDto>;
    }
    return {
      success: false,
      error: '고객 정보를 삭제하는 중 오류가 발생했습니다.',
    };
  }
};

// 엑셀 템플릿 다운로드
export const downloadExcelTemplate = async (): Promise<Blob> => {
  const response = await apiClient.get('/customers/download', {
    responseType: 'blob',
  });
  return response.data;
};

// 엑셀 파일로 고객 정보 업로드
export const uploadCustomersExcel = async (file: File): Promise<ApiResponse<CustomerResDto[]>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<CustomerResDto[]>>(
      '/customers/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<CustomerResDto[]>;
    }
    return {
      success: false,
      error: '고객 정보 업로드 중 오류가 발생했습니다.',
    };
  }
};

// 고객 상세 정보 조회 (상담 내역 포함)
export const getCustomerById = async (id: number): Promise<ApiResponse<Customer>> => {
  try {
    const response = await apiClient.get<ApiResponse<Customer>>(
      `/customers/${id}?include=consultations`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<Customer>;
    }
    return {
      success: false,
      error: '고객 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 고객 상담 목록 조회 API
export const getCustomerConsultations = async (
  id: number,
  page: number,
  size: number
): Promise<ApiResponse<ConsultationListResDto>> => {
  try {
    const response = await apiClient.get<ApiResponse<ConsultationListResDto>>(
      `/customers/${id}/consultations?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<ConsultationListResDto>;
    }
    return {
      success: false,
      error: '고객 상담 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 고객 문의 목록 조회 API
export const getCustomerInquiries = async (
  id: number,
  page: number,
  size: number
): Promise<ApiResponse<InquiryListResponse>> => {
  try {
    const response = await apiClient.get<ApiResponse<InquiryListResponse>>(
      `/customers/${id}/inquiries?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<InquiryListResponse>;
    }
    return {
      success: false,
      error: '고객 문의 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

export const getCustomerSellContracts = async (
  customerId: number,
  page: number = 1,
  size: number = 5
): Promise<ApiResponse<ContractListResDto>> => {
  try {
    const response = await apiClient.get<ApiResponse<ContractListResDto>>(
      `/customers/${customerId}/sell-contracts?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<ContractListResDto>;
    }
    return {
      success: false,
      error: '고객 매도 계약 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

export const getCustomerBuyContracts = async (
  customerId: number,
  page: number = 1,
  size: number = 5
): Promise<ApiResponse<ContractListResDto>> => {
  try {
    const response = await apiClient.get<ApiResponse<ContractListResDto>>(
      `/customers/${customerId}/buy-contracts?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<ContractListResDto>;
    }
    return {
      success: false,
      error: '고객 매수 계약 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 고객 복구
export const restoreCustomer = async (id: number): Promise<ApiResponse<CustomerResDto>> => {
  try {
    const response = await apiClient.put<ApiResponse<CustomerResDto>>(`/customers/restore/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<CustomerResDto>;
    }
    return {
      success: false,
      error: '고객 복구 중 오류가 발생했습니다.',
    };
  }
};

export const getRecentCustomers = async (
  page: number = 0,
  size: number = 5
): Promise<ApiResponse<CustomerListResDto>> => {
  try {
    const response = await apiClient.get<ApiResponse<CustomerListResDto>>('/customers/recent', {
      params: {
        page,
        size,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<CustomerListResDto>;
    }
    return {
      success: false,
      error: '최근 신규 고객 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 고객 문자 내역 조회
export const getCustomerSms = async (
  customerId: number,
  page: number = 1,
  size: number = 10
): Promise<ApiResponse<SmsListResDto>> => {
  try {
    const response = await apiClient.get<ApiResponse<SmsListResDto>>(
      `/customers/${customerId}/sms?page=${page}&size=${size}`
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: '고객 문자 내역을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

export const getCustomerRecommendProperties = async (
  customerId: number,
  limit: number
): Promise<ApiResponse<FindPropertyResDto[]>> => {
  try {
    const response = await apiClient.get(`/customers/${customerId}/recommend?limit=${limit}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<FindPropertyResDto[]>;
    }
    return {
      success: false,
      error: '추천 매물을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

export const getCustomerRecommendCrawlProperties = async (
  customerId: number,
  limit: number
): Promise<ApiResponse<CrawlingPropertyResDto[]>> => {
  try {
    const response = await apiClient.get(`/customers/${customerId}/recommend-crawl?limit=${limit}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<CrawlingPropertyResDto[]>;
    }
    return {
      success: false,
      error: '추천 공개 매물을 불러오는 중 오류가 발생했습니다.',
    };
  }
};
