import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  CreateCustomerResDto,
  CreateCustomerReqDto,
  CustomerListResDto,
  CustomerSearchFilter,
} from '../types/customer';
import axios from 'axios';

// 현재 로그인한 에이전트의 고객 리스트 조회 (상담 내역 제외)
export const getMyCustomers = async (
  filter: CustomerSearchFilter
): Promise<ApiResponse<CustomerListResDto>> => {
  try {
    let url = `/customers?page=${filter.page}&size=${filter.size}`;
    if (filter.keyword) {
      url += `&keyword=${encodeURIComponent(filter.keyword)}`;
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
): Promise<ApiResponse<CreateCustomerResDto>> => {
  try {
    const response = await apiClient.post<ApiResponse<CreateCustomerResDto>>(
      '/customers',
      customerData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<CreateCustomerResDto>;
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
): Promise<ApiResponse<CreateCustomerReqDto>> => {
  try {
    const response = await apiClient.put<ApiResponse<CreateCustomerResDto>>(
      `/customers/${id}`,
      customerData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<CreateCustomerResDto>;
    }
    return {
      success: false,
      error: '고객 정보를 수정하는 중 오류가 발생했습니다.',
    };
  }
};

export const deleteMyCustomer = async (id: number): Promise<ApiResponse<CreateCustomerResDto>> => {
  try {
    const response = await apiClient.delete<ApiResponse<CreateCustomerResDto>>(`/customers/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<CreateCustomerResDto>;
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
export const uploadCustomersExcel = async (
  file: File
): Promise<ApiResponse<CreateCustomerResDto[]>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<CreateCustomerResDto[]>>(
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
      return error.response.data as ApiResponse<CreateCustomerResDto[]>;
    }
    return {
      success: false,
      error: '고객 정보 업로드 중 오류가 발생했습니다.',
    };
  }
};

// 고객 상담 내역 조회
export const getCustomerConsultations = async (customerId: number) => {
  try {
    const response = await apiClient.get(`/customers/${customerId}/consultations`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || '고객 상담 내역을 불러오는데 실패했습니다.',
    };
  }
};

// 고객 매수 계약 내역 조회
export const getCustomerPurchaseContracts = async (customerId: number) => {
  try {
    const response = await apiClient.get(`/customers/${customerId}/buy-contracts`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || '고객 매수 계약 내역을 불러오는데 실패했습니다.',
    };
  }
};

// 고객 매도 계약 내역 조회
export const getCustomerSaleContracts = async (customerId: number) => {
  try {
    const response = await apiClient.get(`/customers/${customerId}/sell-contracts`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || '고객 매도 계약 내역을 불러오는데 실패했습니다.',
    };
  }
};

// 고객 문의 내역 조회
export const getCustomerInquiries = async (customerId: number) => {
  try {
    const response = await apiClient.get(`/customers/${customerId}/inquiries`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || '고객 문의 내역을 불러오는데 실패했습니다.',
    };
  }
};
