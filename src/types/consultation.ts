import type { FindPropertyResDto } from './property';

// Customer 타입 이름을 ConsultationCustomer로 변경하여 충돌 방지
export interface ConsultationCustomer {
  id: string;
  name: string;
  phone: string;
}

// 기존 Customer 타입을 사용하는 곳을 ConsultationCustomer로 변경
export type ConsultationType = 'phone' | 'visit';
export type ConsultationStatus = 'reserved' | 'completed' | 'cancelled';

// 백엔드 API와 일치하는 요청 DTO
export interface CreateConsultationReqDto {
  agentId: number;
  customerId: number;
  consultationType: ConsultationType;
  content?: string;
  consultationDate?: string; // ISO 형식 날짜 문자열
  status: ConsultationStatus;
}

// 백엔드 API��� 일치하는 응답 DTO
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

// 상담 상세 정보 응답 DTO
export interface ConsultationResDto {
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

// 상담 필터 타입
export interface ConsultationFilter {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: ConsultationType;
  status?: ConsultationStatus;
}

export interface Consultation {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  phone: string;
  type: string;
  status: string;
  content: string;
  consultant: string;
  createdAt: string;
  updatedAt: string;
  agent?: {
    id: string;
    name: string;
  };
  relatedProperties?: FindPropertyResDto[];
}
