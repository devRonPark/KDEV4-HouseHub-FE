import { PaginationDto } from './pagination';

// Customer 타입 이름을 ConsultationCustomer로 변경하여 충돌 방지
export interface ConsultationCustomer {
  id: string;
  name: string;
  phone: string;
}

// 기존 Customer 타입을 사용하는 곳을 ConsultationCustomer로 변경
export type ConsultationType = 'PHONE' | 'VISIT';

export const toApiConsultationType = (type: ConsultationType): 'PHONE' | 'VISIT' => {
  return type;
};

export enum ConsultationStatus {
  COMPLETED = 'COMPLETED',
  RESERVED = 'RESERVED',
  CANCELED = 'CANCELED',
}

export const toApiStatus = (status: ConsultationStatus): ConsultationStatus => {
  return status;
};

// 백엔드 API와 일치하는 요청 DTO
export interface CreateConsultationReqDto {
  agentId: number;
  customerId: number;
  consultationType: ConsultationType;
  content?: string;
  consultationDate?: string; // ISO 형식 날짜 문자열
  status: ConsultationStatus;
}

// 백엔드 API 일치하는 응답 DTO
export interface CreateConsultationResDto {
  id: number;
  agentId: number;
  customerId: number;
  consultationType: ConsultationType;
  content?: string;
  consultationDate?: string;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ConsultationCustomerResDto {
  id: number;
  name: string;
  contact: string;
  email: string;
}

// 상담 상세 정보 응답 DTO
export interface ConsultationResDto {
  id: number;
  agentId: number;
  customer: ConsultationCustomerResDto;
  consultationType: ConsultationType;
  content?: string;
  consultationDate?: string;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// 상담 목록 응답 DTO
export interface ConsultationListResDto {
  content: ConsultationResDto[];
  pagination: PaginationDto;
}

// 상담 검색 필터 타입
export interface ConsultationFilter {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  type?: ConsultationType;
  status?: ConsultationStatus;
}

export interface Consultation {
  id: number;
  type: ConsultationType;
  date: string;
  agentId: number;
  agent?: {
    name: string;
  };
  relatedProperties?: Array<{
    id: number;
    name: string;
  }>;
  status: ConsultationStatus;
  content: string;
  consultationType: ConsultationType;
  consultationDate: string;
  customer?: {
    id: number;
    name: string;
    contact: string;
    email: string;
  };
}

// 백엔드 응답을 프론트엔드 형식으로 변환하는 함수 추가
export const fromApiConsultationType = (type: string): ConsultationType => {
  return type as ConsultationType;
};

export const fromApiStatus = (status: string): ConsultationStatus => {
  return status as ConsultationStatus;
};

// DTO 변환 함수 추가
export const toApiConsultationDto = (data: CreateConsultationReqDto): CreateConsultationReqDto => {
  return {
    ...data,
    consultationType: toApiConsultationType(data.consultationType),
    status: toApiStatus(data.status),
  };
};

export const fromApiConsultationDto = (data: ConsultationResDto): ConsultationResDto => {
  return {
    ...data,
    consultationType: fromApiConsultationType(data.consultationType),
    status: fromApiStatus(data.status),
  };
};

// 목록 응답 변환 함수
export const fromApiConsultationListDto = (
  data: ConsultationListResDto
): ConsultationListResDto => {
  return {
    content: data.content.map((item: ConsultationResDto) => fromApiConsultationDto(item)),
    pagination: data.pagination,
  };
};
