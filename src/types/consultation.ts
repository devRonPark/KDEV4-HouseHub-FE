import { PaginationInfo } from './inquiry';
import type { CustomerResDto } from './customer';

export enum ConsultationType {
  PHONE = 'PHONE',
  VISIT = 'VISIT',
  EMAIL = 'EMAIL',
  OTHER = 'OTHER',
}

export enum ConsultationStatus {
  RESERVED = 'RESERVED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

// 문의 목록 응답 타입
export interface ConsultationListResDto {
  content: ConsultationResDto[];
  pagination: PaginationInfo;
}

export interface ConsultationResDto {
  id: number;
  agentId: number;
  customer: CustomerResDto;
  consultationType: ConsultationType;
  content: string;
  consultationDate: string; // LocalDateTime을 string으로 표현
  status: ConsultationStatus;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface NewCustomerDto {
  name?: string;
  contact: string; // @Pattern(regexp = "^\\d{2,3}-\\d{3,4}-\\d{4}$")
  email?: string;
}

export interface ConsultationReqDto {
  agentId: number;
  customerId?: number;
  newCustomer?: NewCustomerDto;
  consultationType: ConsultationType;
  content?: string;
  consultationDate?: string; // LocalDateTime을 string으로 표현
  status: ConsultationStatus;
}

export interface UpdateConsultationReqDto {
  agentId: number;
  consultationType?: ConsultationType;
  content?: string;
  consultationDate?: string; // LocalDateTime을 string으로 표현
  status?: ConsultationStatus;
}

// 상담 유형 표시 레이블 매핑
export const consultationTypeLabels: Record<ConsultationType, string> = {
  [ConsultationType.PHONE]: '전화상담',
  [ConsultationType.VISIT]: '방문상담',
  [ConsultationType.EMAIL]: '이메일상담',
  [ConsultationType.OTHER]: '기타',
};

// 상담 상태 표시 레이블 매핑
export const consultationStatusLabels: Record<ConsultationStatus, string> = {
  [ConsultationStatus.RESERVED]: '예약됨',
  [ConsultationStatus.COMPLETED]: '완료',
  [ConsultationStatus.CANCELED]: '취소됨',
};
