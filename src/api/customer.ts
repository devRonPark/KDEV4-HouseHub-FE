import apiClient from "./client"
import type { ApiResponse } from "./auth"
import type { Customer } from "../types/property"

// 고객 검색 API
export const searchCustomers = async (
  query: string,
  page = 1,
  limit = 10,
): Promise<ApiResponse<{ customers: Customer[]; total: number }>> => {
  try {
    const response = await apiClient.get<ApiResponse<{ customers: Customer[]; total: number }>>(
      `/customers/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    )
    return response.data
  } catch (error) {
    return {
      success: false,
      error: "고객 검색 중 오류가 발생했습니다.",
    }
  }
}

// 고객 상세 정보 조회 API
export const getCustomerById = async (id: number): Promise<ApiResponse<Customer>> => {
  try {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`)
    return response.data
  } catch (error) {
    return {
      success: false,
      error: "고객 정보를 불러오는 중 오류가 발생했습니다.",
    }
  }
}

