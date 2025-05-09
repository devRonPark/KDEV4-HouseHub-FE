import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  ContractReqDto,
  ContractListResDto,
  ContractSearchFilter,
  FindContractResDto,
} from '../types/contract';

// 계약 등록 API
export const registerContract = async (
  contractData: ContractReqDto
): Promise<ApiResponse<{ id: number }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ id: number }>>('/contracts', contractData);
    return response.data;
  } catch {
    return {
      success: false,
      error: '계약 등록 중 오류가 발생했습니다.',
    };
  }
};

// 계약 목록 조회 API
export const getContracts = async (
  filter: ContractSearchFilter
): Promise<ApiResponse<ContractListResDto>> => {
  try {
    let url = `/contracts?page=${filter.page}&size=${filter.size}`;

    if (filter.agentName) {
      url += `&agentName=${encodeURIComponent(filter.agentName)}`;
    }

    if (filter.customerName) {
      url += `&customerName=${encodeURIComponent(filter.customerName)}`;
    }

    if (filter.contractType) {
      url += `&contractType=${filter.contractType}`;
    }

    if (filter.status) {
      url += `&status=${filter.status}`;
    }

    const response = await apiClient.get<ApiResponse<ContractListResDto>>(url);
    return response.data;
  } catch {
    return {
      success: false,
      error: '계약 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 계약 상세 조회 API
export const getContractById = async (id: number): Promise<ApiResponse<FindContractResDto>> => {
  try {
    const response = await apiClient.get<ApiResponse<FindContractResDto>>(`/contracts/${id}`);
    return response.data;
  } catch {
    return {
      success: false,
      error: '계약 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 계약 수정 API
export const updateContract = async (
  id: number,
  contractData: ContractReqDto
): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.put<ApiResponse<void>>(`/contracts/${id}`, contractData);
    return response.data;
  } catch {
    return {
      success: false,
      error: '계약 수정 중 오류가 발생했습니다.',
    };
  }
};

// 계약 삭제 API
export const deleteContract = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(`/contracts/${id}`);
    return response.data;
  } catch {
    return {
      success: false,
      error: '계약 삭제 중 오류가 발생했습니다.',
    };
  }
};

// 고객 매수 계약 내역 조회
export const getCustomerBuyContracts = async (
  customerId: number,
  customerName: string,
  page: number,
  size: number = 10
): Promise<ApiResponse<ContractListResDto>> => {
  try {
    const response = await apiClient.get<ApiResponse<ContractListResDto>>(
      `/customers/${customerId}/buy-contracts`,
      {
        params: {
          customerName,
          page,
          size,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('고객 매수 계약 내역 조회 중 오류:', error);
    return {
      success: false,
      error: '고객 매수 계약 내역을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 고객 매도 계약 내역 조회
export const getCustomerSellContracts = async (
  customerId: number,
  customerName: string,
  page: number,
  size: number = 10
): Promise<ApiResponse<ContractListResDto>> => {
  try {
    const response = await apiClient.get<ApiResponse<ContractListResDto>>(
      `/customers/${customerId}/sell-contracts`,
      {
        params: {
          customerName,
          page,
          size,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('고객 매도 계약 내역 조회 중 오류:', error);
    return {
      success: false,
      error: '고객 매도 계약 내역을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

export const getCompletedContractsThisMonth = async (): Promise<ApiResponse<ContractListResDto>> => {
  try {
    const response = await apiClient.get('/contracts/completed/this-month');
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: '이번 달 완료된 계약 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};
