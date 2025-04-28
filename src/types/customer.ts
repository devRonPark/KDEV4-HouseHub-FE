import type { PaginationDto } from './pagination';
import type { Consultation } from './consultation';

export interface Customer {
  id: number;
  name: string;
  email?: string;
  contact: string;
  birthDate?: string; // 선택적
  gender?: 'M' | 'F'; // 선택적
  memo?: string; // 선택적
  ageGroup?: number;
  consultations?: Consultation[]; // 선택적
  createdAt: string;
  updatedAt: string | null;
  deletedAt?: string | null;
}

// 필요한 경우 하위 DTO 인터페이스 추가
export interface CreateCustomerReqDto {
  name?: string;
  email?: string;
  contact: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  memo?: string;
  ageGroup?: number;
}

export interface CreateCustomerResDto {
  id: number;
  name: string;
  email: string;
  contact: string;
  birthDate: string;
  gender?: 'M' | 'F' | undefined;
  memo?: string;
  createdAt: string;
  updatedAt: string;
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
  includeDeleted?: boolean;
}
