import { PaginationDto } from './pagination';

// 알림 타입 정의
export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

// 백엔드 엔티티 구조에 맞는 알림 객체 인터페이스
export interface Notification {
  id: number;
  receiverId: number;
  type: NotificationType;
  content: string;
  url?: string;
  isRead: boolean;
  createdAt: string;
}

// SSE로부터 받는 알림 데이터 인터페이스
export interface NotificationEvent {
  id: number;
  receiverId: number;
  type: NotificationType;
  content: string;
  url?: string;
  createdAt: string;
  isRead: boolean;
}

// 알림 목록 응답 타입
export interface NotificationListResponse {
  content: Notification[];
  pagination: PaginationDto;
}

// 문의 검색 필터 타입
export interface NotificationFilter {
  filter: 'all' | 'read' | 'unread';
  page: number;
  size: number;
}
