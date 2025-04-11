import type { PaginationDto } from './pagination';

export interface Customer {
  id: number;
  name: string;
  email: string;
  contact: string;
  ageGroup?: number; // 선택적
  gender?: 'M' | 'F' | undefined; // 선택적
  memo?: string; // 선택적
  createdAt: string;
  updatedAt: string | null;
  deletedAt?: string | null;
}

// 필요한 경우 하위 DTO 인터페이스 추가
export interface CreateCustomerReqDto {
  name: string;
  email: string;
  contact: string;
  ageGroup?: number;
  gender?: 'M' | 'F' | undefined;
  memo?: string;
}

export interface CreateCustomerResDto {
  id: number;
  name: string;
  email: string;
  contact: string;
  ageGroup: number;
  gender?: 'M' | 'F' | undefined;
  memo?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CustomerListResDto {
  content: CreateCustomerResDto[];
  pagination: PaginationDto;
}

// 고객 검색 필터
export interface CustomerSearchFilter {
  keyword?: string;
  page: number;
  size: number;
}
