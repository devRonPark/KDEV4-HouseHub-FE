// SMS 관련 타입 정의
export interface Sms {
  id: number;
  sender: string;
  receiver: string;
  msg: string;
  msgType: 'SMS' | 'LMS' | 'MMS';
  title: string;
  status: 'SUCCESS' | 'FAIL';
  rdate: string;
  rtime: string;
  createdAt: string; // LocalDateTime ISO 포맷 문자열
  updatedAt: string | null;
  deletedAt?: string | null;
}

export interface SmsTemplate {
  id: number;
  title: string;
  content: string;
  createdAt: string; // LocalDateTime ISO 포맷 문자열
  updatedAt: string | null;
  deletedAt?: string | null;
}

// 문자 발송 요청 DTO
export interface SendSmsReqDto {
  sender: string; // 발신 번호
  receiver: string; // 수신 번호 목록
  msg: string; // 메시지 내용
  msgType: 'SMS' | 'LMS' | 'MMS'; // 메시지 유형
  title?: string;
  rdate?: string; // 예약일(YYYYMMDD)
  rtime?: string; // 예약 발송 시간 (ISO 형식)
  templateId?: number; // 템플릿 ID
}

// 문자 발송 응답 DTO
export interface SendSmsResDto {
  id: number; // 메시지 ID
  sender: string; // 발신 번호
  receiver: string; // 수신 번호 목록
  msg: string; // 메시지 내용
  msgType: 'SMS' | 'LMS' | 'MMS'; // 메시지 유형
  title?: string; // 제목
  status: 'SUCCESS' | 'FAIL';
  rtime: string; // 예약 발송 시간
  rdate: string; // 예약 발송 일자
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
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
  createdAt: string; // 생성 시간
  updatedAt: string; // 수정 시간
}
