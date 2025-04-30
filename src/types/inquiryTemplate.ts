// 문의 템플릿 타입 열거형
export enum InquiryTemplateType {
  '아파트_매도',
  '아파트_매수',
  '아파트_임대',
  '아파트_임차',
  '오피스텔_매도',
  '오피스텔_매수',
  '오피스텔_임대',
  '오피스텔_임차',
  '상가_매도',
  '상가_매수',
  '상가_임대',
  '상가_임차',
  '사무실_매도',
  '사무실_매수',
  '사무실_임대',
  '사무실_임차',
  '원룸_매도',
  '원룸_매수',
  '원룸_임대',
  '원룸_임차',
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
  REGION = 'REGION',
}

// 문의 템플릿 타입 정의
export interface InquiryTemplate {
  id: string;
  type: InquiryTemplateType;
  name: string;
  description: string;
  isActive: boolean;
  shareToken: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
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
  type: InquiryTemplateType;
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
  type?: InquiryTemplateType | '';
}
