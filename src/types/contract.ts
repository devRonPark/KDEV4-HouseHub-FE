import type { CustomerSummaryDto } from './customer';
import type { PropertySummaryResDto } from './property';
import type { PaginationDto } from './pagination';

// 계약 유형 enum
export enum ContractType {
  SALE = 'SALE', // 매매
  JEONSE = 'JEONSE', // 전세
  MONTHLY_RENT = 'MONTHLY_RENT', // 월세
}

// 계약 상태 enum
export enum ContractStatus {
  AVAILABLE = 'AVAILABLE', // 계약 가능
  IN_PROGRESS = 'IN_PROGRESS', // 계약 진행 중
  COMPLETED = 'COMPLETED', // 계약 완료
  CANCELED = 'CANCELED', // 계약 취소
}

// 계약 유형 표시 텍스트
export const ContractTypeLabels: Record<ContractType, string> = {
  [ContractType.SALE]: '매매',
  [ContractType.JEONSE]: '전세',
  [ContractType.MONTHLY_RENT]: '월세',
};

// 계약 상태 표시 텍스트
export const ContractStatusLabels: Record<ContractStatus, string> = {
  [ContractStatus.AVAILABLE]: '계약 가능',
  [ContractStatus.IN_PROGRESS]: '계약 진행 중',
  [ContractStatus.COMPLETED]: '계약 완료',
  [ContractStatus.CANCELED]: '계약 취소',
};

// 계약 유형별 배경색 및 텍스트 색상
export const ContractTypeColors: Record<ContractType, { bg: string; text: string }> = {
  [ContractType.SALE]: { bg: 'bg-blue-100', text: 'text-blue-800' },
  [ContractType.JEONSE]: { bg: 'bg-green-100', text: 'text-green-800' },
  [ContractType.MONTHLY_RENT]: { bg: 'bg-purple-100', text: 'text-purple-800' },
};

// 계약 상태별 배경색 및 텍스트 색상
export const ContractStatusColors: Record<ContractStatus, { bg: string; text: string }> = {
  [ContractStatus.AVAILABLE]: { bg: 'bg-blue-100', text: 'text-blue-800' },
  [ContractStatus.IN_PROGRESS]: { bg: 'bg-blue-100', text: 'text-blue-800' },
  [ContractStatus.COMPLETED]: { bg: 'bg-green-100', text: 'text-green-800' },
  [ContractStatus.CANCELED]: { bg: 'bg-red-100', text: 'text-red-800' },
};

// 매물 등록시 기본 계약 정보 등록 요청 DTO
export interface BasicContractReqDto {
  contractType: ContractType;
  salePrice?: number | null;
  jeonsePrice?: number | null;
  monthlyRentDeposit?: number | null;
  monthlyRentFee?: number | null;
}

// 계약 등록 요청 DTO
export interface ContractReqDto {
  propertyId?: number;
  customerId?: number | null;
  contractType: ContractType;
  contractStatus: ContractStatus;
  memo?: string | null;
  startedAt?: string | null;
  expiredAt?: string | null;
  salePrice?: number | null;
  jeonsePrice?: number | null;
  monthlyRentDeposit?: number | null;
  monthlyRentFee?: number | null;
  completedAt?: string | null; // 계약 완료일
  // active?: boolean; // 계약 활성화 여부
}

export interface FindContractResDto {
  id: number; // 계약 ID
  contractType: ContractType; // 거래 유형 (매매, 전세, 월세 등)
  property: PropertySummaryResDto; // 매물 요약 정보
  seeker: CustomerSummaryDto; // 고객 정보 (매수/임차)
  provider: CustomerSummaryDto; // 고객 정보 (매도/임대) - 집주인
  // 금액 정보
  salePrice: string; // 매매가
  jeonsePrice: string; // 전세가
  monthlyRentFee: string; // 월세 금액
  monthlyRentDeposit: string; // 월세 보증금
  status: ContractStatus; // 계약 상태
  memo: string; // 계약 관련 메모
  // 계약 기간 정보
  startedAt: string;     // 계약 시작일 (ISO 8601 형식 날짜 문자열 예상)
  expiredAt: string;     // 계약 만료일
  completedAt: string;   // 계약 완료일
}

// 계약 목록 응답 DTO
export interface ContractListResDto {
  content: FindContractResDto[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// 계약 검색 필터
export interface ContractSearchFilter {
  agentName?: string;
  customerName?: string;
  contractType?: ContractType | null;
  status?: ContractStatus | null;
  // active?: boolean | null;
  page: number;
  size: number;
}

export interface ExpiringContract {
  id: number;
  propertyAddress: string;
  customerName: string;
  contractType: '매매' | '전세' | '월세';
  expiredAt: string;
  displayStatus: '임박' | '만료' | '정상';
  dday: string;
}

export interface ContractSummaryDto {
  id: number; // 계약 ID
  status: ContractStatus; // 계약 상태
  contractType: ContractType; // 거래 유형
  salePrice?: string; // 매매가 (SALE일 경우만)
  jeonsePrice?: string; // 전세가 (JEONSE일 경우만)
  monthlyRentFee?: string; // 월세 금액 (MONTHLY일 경우만)
  monthlyRentDeposit?: string; // 월세 보증금 (MONTHLY일 경우만)
}

export interface ContractFormData {
  propertyId: number | null;
  customerId: number | null;
  contractType: ContractType;
  contractStatus: ContractStatus;
  salePrice: string;
  jeonsePrice: string;
  monthlyRentDeposit: string;
  monthlyRentFee: string;
  startedAt: string;
  expiredAt: string;
  completedAt: string;
  memo: string;
}