// 문의 템플릿 타입 정의
export interface InquiryTemplate {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  questions: Question[];
  createdAt: string;
  // updatedAt: string;
}

// 질문 유형 열거형
export enum QuestionType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  SELECT = 'SELECT',
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  DATE = 'DATE',
  FILE = 'FILE',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  NUMBER = 'NUMBER',
}

// 질문 타입 정의
export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  isRequired: boolean;
  options?: string[];
  questionOrder: number;
}

// 템플릿 목록 조회 응답 타입
export interface InquiryTemplateListResponse {
  content: InquiryTemplate[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    size: number;
  };
}

// 템플릿 생성/수정 요청 타입
export interface InquiryTemplateRequest {
  name: string;
  description: string;
  isActive: boolean;
  questions: Omit<Question, 'id'>[];
}

// 템플릿 필터 타입
export interface InquiryTemplateFilter {
  keyword?: string;
  isActive?: boolean;
  page: number;
}
