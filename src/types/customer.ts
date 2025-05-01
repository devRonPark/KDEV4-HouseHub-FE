import type { PaginationDto } from './pagination';
import type { TagResDto } from './tag';

export interface Customer {
  id: number;
  name?: string;
  email?: string;
  contact: string;
  birthDate?: string; // 선택적
  gender?: 'M' | 'F'; // 선택적
  memo?: string | null;
  tagIds?: number[];
  ageGroup?: number;
  createdAt?: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  tags?: TagResDto[];
}

// 필요한 경우 하위 DTO 인터페이스 추가
export interface CreateCustomerReqDto {
  name?: string;
  email?: string;
  contact: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  memo?: string | null;
  tagIds?: number[];
}

export interface CustomerResDto {
  id: number;
  name?: string;
  email?: string;
  contact: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  memo?: string | null;
  tagIds?: number[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CustomerListResDto {
  content: CustomerResDto[];
  pagination: PaginationDto;
}

// 고객 검색 필터
export interface CustomerSearchFilter {
  keyword?: string;
  page: number;
  size: number;
  includeDeleted?: boolean;
}
