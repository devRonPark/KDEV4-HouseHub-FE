// API 응답 타입 정의
export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
