export interface CrawlingTagResDto {
  tagId: number;
  type: string;
  value: string;
}

export interface SuccessResponse<T> {
  success: boolean;
  message: string;
  code: string;
  data: T;
}