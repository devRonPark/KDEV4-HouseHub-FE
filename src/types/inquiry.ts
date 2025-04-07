// 질문 타입 열거형
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

// 질문 인터페이스
export interface Question {
  id: number;
  label: string;
  type: QuestionType;
  isRequired: boolean;
  questionOrder: number;
  options?: string[] | null;
}

// 템플릿 인터페이스
export interface InquiryTemplate {
  name: string;
  questions: Question[];
}

// 문의 답변 타입
export interface InquiryAnswer {
  questionId: number;
  answerText: string;
}

// 폼 상태 인터페이스
export interface FormState {
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// 문의 등록 요청 타입
export interface CreateInquiryRequest {
  templateToken: string; // 템플릿 공유 토큰
  name: string; // 고객 이름 (첫 번째 질문 답변)
  email: string; // 고객 이메일 (두 번째 질문 답변)
  phone: string; // 고객 전화번호 (세 번째 질문 답변)
  answers: InquiryAnswer[]; // 질문에 대한 답변 목록
}

// 문의 등록 성공 응답 타입
export interface CreateInquirySuccessResponse {
  inquiryId: number;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

// Union 타입 (응답 처리 시 사용)
export type CreateInquiryResponse = CreateInquirySuccessResponse | ErrorResponse;
