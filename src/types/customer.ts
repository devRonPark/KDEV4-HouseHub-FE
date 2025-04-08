import type { PaginationDto } from './pagination';

export interface Customer {
  id: number; // Java Long -> TS number
  name: string;
  email: string;
  contact: string; // Java의 phone 필드(phone -> contact으로 명시적 매핑)
  ageGroup: number;
  gender: 'M' | 'F';
  memo?: string;
  createdAt: string; // LocalDateTime ISO 포맷 문자열
  updatedAt: string | null;
  deletedAt?: string | null;
}

// 필요한 경우 하위 DTO 인터페이스 추가
export interface CreateCustomerReqDto {
  name: string;
  email: string;
  contact: string;
  ageGroup: number;
  gender: 'M' | 'F';
  memo?: string;
}

export interface CreateCustomerResDto {
  id: number;
  name: string;
  email: string;
  contact: string;
  ageGroup: number;
  gender: 'M' | 'F';
  memo?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CustomerListResDto {
  content: CreateCustomerResDto[];
  pagination: PaginationDto;
}
