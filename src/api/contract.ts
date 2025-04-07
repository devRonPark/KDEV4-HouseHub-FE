import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  ContractReqDto,
  ContractListResponse,
  ContractSearchFilter,
  ContractResDto,
} from '../types/contract';

// 계약 등록 API
export const registerContract = async (
  contractData: ContractReqDto
): Promise<ApiResponse<{ id: number }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ id: number }>>('/contracts', contractData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: '계약 등록 중 오류가 발생했습니다.',
    };
  }
};

// 계약 목록 조회 API
export const getContracts = async (
  filter: ContractSearchFilter
): Promise<ApiResponse<ContractListResponse>> => {
  try {
    const params = new URLSearchParams();
    params.append('page', filter.page.toString());
    params.append('size', filter.size.toString());

    if (filter.agentName) params.append('agentName', filter.agentName);
    if (filter.customerName) params.append('customerName', filter.customerName);
    if (filter.contractType) params.append('contractType', filter.contractType);
    if (filter.status) params.append('status', filter.status);

    const response = await apiClient.get<ApiResponse<ContractListResponse>>(
      `/contracts?${params.toString()}`
    );
    // return response.data;

    // 응답 구조가 예상과 다를 경우 안전하게 처리
    if (response.data.success) {
      // 응답 데이터가 직접 배열인 경우
      if (Array.isArray(response.data.data)) {
        return {
          success: true,
          data: {
            contracts: response.data.data,
            totalPages: 1, // 기본값
            totalElements: response.data.data.length,
            currentPage: filter.page,
            size: filter.size,
          },
        };
      }
      // 응답이 예상한 구조인 경우
      else if (response.data.data && response.data.data.contracts) {
        return response.data;
      }
      // 다른 구조인 경우
      else {
        return {
          success: true,
          data: {
            contracts: response.data.data?.contracts || [],
            totalPages: response.data.data?.totalPages || 1,
            totalElements: response.data.data?.totalElements || 0,
            currentPage: filter.page,
            size: filter.size,
          },
        };
      }
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return {
      success: false,
      error: '계약 목록을 불러오는데 실패했습니다.',
    };
  }
};

// 계약 상세 조회 API
export const getContractById = async (id: number): Promise<ApiResponse<ContractResDto>> => {
  try {
    const response = await apiClient.get<ApiResponse<ContractResDto>>(`/contracts/${id}`);
    return response.data;
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    return {
      success: false,
      error: '계약 삭제 중 오류가 발생했습니다.',
    };
  }
};
