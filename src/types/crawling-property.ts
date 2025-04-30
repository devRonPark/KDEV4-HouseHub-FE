export type CrawlingPropertyType = 'APARTMENT' | 'OFFICETEL' | 'VILLA' | 'ONEROOM' | 'TWOROOM';
export type CrawlingTransactionType = 'SALE' | 'JEONSE' | 'MONTHLY';
export type CrawlingDirection = 'EAST' | 'WEST' | 'SOUTH' | 'NORTH' | 'SOUTH_EAST' | 'SOUTH_WEST' | 'NORTH_EAST' | 'NORTH_WEST';

export interface PaginationDto {
  totalPages: number;
  totalElements: number;
  size: number;
  currentPage: number;
}

export interface CrawlingPropertyItem {
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
  salePrice: number;
  deposit?: number;
  monthlyRentFee?: number;
  direction: CrawlingDirection;
  bathRoomCnt: number;
  roomCnt: number;
  realEstateAgentId: string;
  realEstateAgentName: string;
  realEstateAgentContact: string;
  realEstateOfficeName: string;
  realEstateOfficeAddress?: string;
}

export interface CrawlingPropertyListResponse {
  content: CrawlingPropertyItem[];
  pagination: PaginationDto;
}

export interface CrawlingPropertySearchParams {
  propertyType?: CrawlingPropertyType;
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