import type { CreateCustomerResDto } from './customer';
import type { FindPropertyResDto } from './property';
import type { Agent } from './agent';
// 계약 유형 enum
export enum ContractType {
  SALE = 'SALE', // 매매
  JEONSE = 'JEONSE', // 전세
  MONTHLY_RENT = 'MONTHLY_RENT', // 월세
}

// 계약 상태 enum
export enum ContractStatus {
  AVAILABLE = 'AVAILABLE', // 거래 가능
  IN_PROGRESS = 'IN_PROGRESS', // 계약 진행 중
  COMPLETED = 'COMPLETED', // 계약 완료
}

// 계약 유형 표시 텍스트
export const ContractTypeLabels: Record<ContractType, string> = {
  [ContractType.SALE]: '매매',
  [ContractType.JEONSE]: '전세',
  [ContractType.MONTHLY_RENT]: '월세',
};

// 계약 상태 표시 텍스트
export const ContractStatusLabels: Record<ContractStatus, string> = {
  [ContractStatus.AVAILABLE]: '거래 가능',
  [ContractStatus.IN_PROGRESS]: '계약 진행 중',
  [ContractStatus.COMPLETED]: '계약 완료',
};

// 계약 유형별 배경색 및 텍스트 색상
export const ContractTypeColors: Record<ContractType, { bg: string; text: string }> = {
  [ContractType.SALE]: { bg: 'bg-blue-100', text: 'text-blue-800' },
  [ContractType.JEONSE]: { bg: 'bg-green-100', text: 'text-green-800' },
  [ContractType.MONTHLY_RENT]: { bg: 'bg-purple-100', text: 'text-purple-800' },
};

// 계약 상태별 배경색 및 텍스트 색상
export const ContractStatusColors: Record<ContractStatus, { bg: string; text: string }> = {
  [ContractStatus.AVAILABLE]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [ContractStatus.IN_PROGRESS]: { bg: 'bg-blue-100', text: 'text-blue-800' },
  [ContractStatus.COMPLETED]: { bg: 'bg-green-100', text: 'text-green-800' },
};

// 계약 등록 요청 DTO
export interface ContractReqDto {
  propertyId: number;
  customerId: number;
  contractType: ContractType;
  contractStatus: ContractStatus;
  memo?: string;
  startedAt?: string;
  expiredAt?: string;
  salePrice?: number;
  jeonsePrice?: number;
  monthlyRentDeposit?: number;
  monthlyRentFee?: number;
}

// 계약 응답 DTO
export interface ContractResDto {
  id: number;
  agent: Agent;
  property: FindPropertyResDto;
  customer: CreateCustomerResDto;
  contractType: ContractType;
  status: ContractStatus;
  salePrice?: number;
  jeonsePrice?: number;
  monthlyRentFee?: number;
  monthlyRentDeposit?: number;
  memo?: string;
  startedAt?: string;
  expiredAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 계약 상세 응답 DTO
// export interface ContractDetailResDto extends ContractResDto {
//   property: {
//     id: number;
//     address: string;
//     detailAddress: string;
//     propertyType: string;
//   };
//   customer: Customer;
// }

// 계약 목록 페이지네이션 응답
export interface ContractListResponse {
  contracts: ContractResDto[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
}

// 계약 검색 필터
export interface ContractSearchFilter {
  agentName?: string;
  customerName?: string;
  contractType?: ContractType;
  status?: ContractStatus;
  page: number;
  size: number;
}
