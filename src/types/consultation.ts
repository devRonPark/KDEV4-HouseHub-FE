import { PaginationInfo } from './inquiry';

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

export interface CustomerResDto {
  id: number;
  name: string;
  contact: string;
  email?: string;
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
