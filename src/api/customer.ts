import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  CreateCustomerResDto,
  CreateCustomerReqDto,
  CustomerListResDto,
} from '../types/customer';
import axios from 'axios';

// 현재 로그인한 에이전트의 고객 리스트 조회
export const getMyCustomers = async (
  page: number,
  size: number
): Promise<ApiResponse<CustomerListResDto>> => {
  try {
    const response = await apiClient.get<ApiResponse<CustomerListResDto>>(
      `/customers?page=${page}&size=${size}`
    );
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
  try {
    const response = await apiClient.get('/customers/download', {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('엑셀 템플릿 다운로드 오류:', error);
    throw error;
  }
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
