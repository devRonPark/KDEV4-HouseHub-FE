import type { FindPropertyResDto } from './property';

// Customer 타입 이름을 ConsultationCustomer로 변경하여 충돌 방지
export interface ConsultationCustomer {
  id: string;
  name: string;
  phone: string;
}

// 기존 Customer 타입을 사용하는 곳을 ConsultationCustomer로 변경
export type ConsultationType = 'phone' | 'visit';

export const toApiConsultationType = (type: ConsultationType): 'PHONE' | 'VISIT' => {
  return type.toUpperCase() as 'PHONE' | 'VISIT';
};

export type ConsultationStatus = 'reserved' | 'completed' | 'cancelled';

export const toApiStatus = (status: ConsultationStatus): 'RESERVED' | 'COMPLETED' | 'CANCELED' => {
  const map = {
    reserved: 'RESERVED',
    completed: 'COMPLETED',
    cancelled: 'CANCELED',
  } as const;

  return map[status];
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

// 백엔드 응답을 프론트엔드 형식으로 변환하는 함수 추가
export const fromApiConsultationType = (type: string): ConsultationType => {
  return type.toLowerCase() as ConsultationType;
};

export const fromApiStatus = (status: string): ConsultationStatus => {
  const map: Record<string, ConsultationStatus> = {
    RESERVED: 'reserved',
    COMPLETED: 'completed',
    CANCELED: 'cancelled',
  };

  return map[status] || 'reserved';
};

// DTO 변환 함수 추가
export const toApiConsultationDto = (data: CreateConsultationReqDto): any => {
  return {
    ...data,
    consultationType: toApiConsultationType(data.consultationType),
    status: toApiStatus(data.status),
  };
};

export const fromApiConsultationDto = (data: any): ConsultationResDto => {
  return {
    ...data,
    consultationType: fromApiConsultationType(data.consultationType),
    status: fromApiStatus(data.status),
  };
};
