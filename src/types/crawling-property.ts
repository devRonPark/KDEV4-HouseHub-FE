import type { PropertyType, PropertyDirection } from './property';
import type { TagResDto } from './tag';

export type CrawlingPropertyType =
  | 'APARTMENT'
  | 'OFFICETEL'
  | 'VILLA'
  | 'ONE_ROOM'
  | 'MULTIFAMILY'
  | 'SINGLEMULTIFAMILY'
  | 'COMMERCIAL'
  | 'ROWHOUSE'
  | 'COUNTRYHOUSE';
export type CrawlingTransactionType = 'SALE' | 'JEONSE' | 'MONTHLY';
export type CrawlingDirection =
  | 'EAST'
  | 'WEST'
  | 'SOUTH'
  | 'NORTH'
  | 'SOUTH_EAST'
  | 'SOUTH_WEST'
  | 'NORTH_EAST'
  | 'NORTH_WEST';

export interface PaginationDto {
  totalPages: number;
  totalElements: number;
  size: number;
  currentPage: number;
}

// 공개 매물 응답 DTO
export interface CrawlingPropertyResDto {
  crawlingPropertiesId: string;
  propertyType: CrawlingPropertyType;
  transactionType: CrawlingTransactionType;
  province: string;
  city: string;
  dong: string;
  detailAddress: string;
  area: number;
  floor: string;
  allFloors: string;
  salePrice: string;
  deposit: string;
  monthlyRentFee: string;
  direction: PropertyDirection;
  bathRoomCnt: number;
  roomCnt: number;
  realEstateAgentId: string;
  realEstateAgentName: string;
  realEstateAgentContact: string;
  realEstateOfficeName: string;
  realEstateOfficeAddress: string;
  tags: TagResDto[];
}

export interface CrawlingPropertyListResponse {
  content: CrawlingPropertyResDto[];
  pagination: PaginationDto;
}

export interface CrawlingPropertySearchParams {
  propertyType?: PropertyType;
  transactionType?: CrawlingTransactionType;
  province?: string;
  city?: string;
  dong?: string;
  minSalePrice?: number;
  maxSalePrice?: number;
  minDeposit?: number;
  maxDeposit?: number;
  minMonthlyRentFee?: number;
  maxMonthlyRentFee?: number;
  page?: number;
  size?: number;
  tagIds?: number[];
}
