import { NotificationType } from '../types/notification';

/**
 * 테스트용 알림 생성 함수
 * 실제 프로덕션에서는 사용하지 않음
 */
export const createTestNotification = (
  content: string,
  type: NotificationType = NotificationType.INFO
) => {
  // SSE 이벤트를 시뮬레이션하는 함수
  const event = new MessageEvent('message', {
    data: JSON.stringify({
      id: Date.now(),
      type,
      content,
      createdAt: new Date().toISOString(),
    }),
  });

  // 이벤트 디스패치
  window.dispatchEvent(new CustomEvent('test-notification', { detail: event }));
};

/**
 * 알림 내용 생성 함수
 * 문의 유형에 따라 다른 알림 내용 생성
 */
export const generateInquiryNotificationContent = (
  customerName: string,
  templateName: string,
  inquiryType: string
): string => {
  return `${customerName}님이 "${templateName}" 템플릿으로 ${inquiryType} 문의를 등록했습니다.`;
};
