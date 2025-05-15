import { useEffect, useCallback } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { NotificationEvent } from '../../types/notification';
import { ToastVariant } from '../../hooks/useToast';

interface Props {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  lastMessage: MessageEvent | null;
}

const SSEHandler = ({ showToast, lastMessage }: Props) => {
  const { setNotifications } = useNotification();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        if (!event || !event.data) return;

        const data: NotificationEvent = JSON.parse(event.data);

        const newNotification = {
          id: data.id,
          type: data.type,
          content: data.content,
          url: data.url,
          isRead: data.isRead,
          createdAt: data.createdAt,
          receiverId: data.receiverId,
        };

        setNotifications((prev) => {
          const exists = prev.some((item) => item.id === newNotification.id);
          if (exists) return prev;
          return [newNotification, ...prev];
        });

        showToast(data.content, 'info');

        if (Notification.permission === 'granted') {
          new Notification('새 문의 알림', {
            body: data.content,
          });
        }
      } catch (err) {
        console.error('알림 처리 중 오류:', err);
      }
    },
    [setNotifications, showToast]
  );

  useEffect(() => {
    if (lastMessage) {
      handleMessage(lastMessage);
    }
  }, [lastMessage, handleMessage]);

  return null;
};

export default SSEHandler;
