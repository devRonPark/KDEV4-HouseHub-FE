// SMS 관련 타입 정의

// 문자 발송 요청 DTO
export interface SendSmsReqDto {
  sender: string; // 발신 번호
  receivers: string[]; // 수신 번호 목록
  message: string; // 메시지 내용
  messageType: 'SMS' | 'LMS' | 'MMS'; // 메시지 유형
  reservationTime?: string; // 예약 발송 시간 (ISO 형식)
  templateId?: number; // 템플릿 ID (선택적)
}

// 문자 발송 응답 DTO
export interface SendSmsResDto {
  id: number; // 메시지 ID
  sender: string; // 발신 번호
  receivers: string[]; // 수신 번호 목록
  message: string; // 메시지 내용
  messageType: 'SMS' | 'LMS' | 'MMS'; // 메시지 유형
  status: 'SUCCESS' | 'FAIL'; // 발송 상태
  sentAt: string; // 발송 시간
  reservationTime?: string; // 예약 발송 시간
  templateId?: number; // 템플릿 ID
  agentId: number; // 에이전트 ID
}

// 알리고 API 문자 내역 조회 요청 DTO
export interface AligoHistoryReqDto {
  page: number; // 페이지 번호
  size: number; // 페이지 크기
  startDate?: string; // 시작 날짜
  limitDay?: number; // 조회 기간 (일)
}

// 알리고 API 문자 내역 상세 DTO
export interface HistoryDetailDto {
  id: string; // 메시지 ID
  sender: string; // 발신 번호
  receiver: string; // 수신 번호
  message: string; // 메시지 내용
  sentAt: string; // 발송 시간
  status: 'SUCCESS' | 'FAIL'; // 발송 상태
}

// 템플릿 생성/수정 요청 DTO
export interface CreateUpdateTemplateReqDto {
  title: string; // 템플릿 제목
  content: string; // 템플릿 내용
}

// 템플릿 응답 DTO
export interface TemplateResDto {
  id: number; // 템플릿 ID
  title: string; // 템플릿 제목
  content: string; // 템플릿 내용
  agentId: number; // 에이전트 ID
  createdAt: string; // 생성 시간
  updatedAt: string; // 수정 시간
}

// API 응답 공통 형식
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  code: string;
  data: T;
}
