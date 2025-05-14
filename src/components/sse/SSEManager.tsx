import { useState, useCallback, useEffect } from 'react';
import useSSE from '../../hooks/useSSE';
import SSEHandler from './SSEHandler';
import { useAuth } from '../../context/useAuth';
import { useToast } from '../../context/useToast';
import { useNotification } from '../../context/NotificationContext';

function SSEManager({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { loadUnreadNotifications } = useNotification();

  const [missedMessages, setMissedMessages] = useState<MessageEvent[]>([]);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [isTabActive, setIsTabActive] = useState<boolean>(
    () => document.visibilityState === 'visible'
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isNowActive = document.visibilityState === 'visible';
      setIsTabActive(isNowActive);

      if (isNowActive && missedMessages.length > 0) {
        missedMessages.forEach((event) => {
          setLastMessage(event);
        });
        setMissedMessages([]);
      }

      if (isNowActive) {
        loadUnreadNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [missedMessages, loadUnreadNotifications]);

  const handleSSEMessage = useCallback((event: MessageEvent) => {
    if (document.visibilityState === 'visible') {
      setLastMessage(event);
    } else {
      setMissedMessages((prev) => [...prev, event]);

      try {
        const data = JSON.parse(event.data);
        if (Notification.permission === 'granted') {
          new Notification('새 알림', {
            body: data.content || '새로운 알림이 도착했습니다.',
            icon: '/logo192.png',
            tag: `notification-${data.id}`,
          });
        }
      } catch (err) {
        console.error('브라우저 알림 생성 실패:', err);
      }
    }
  }, []);

  const { isConnected, reconnect } = useSSE({
    url: `http://localhost:8080/api/notifications/sse/connect`,
    withCredentials: true,
    onMessage: handleSSEMessage,
    onError: (error) => {
      console.error('SSE 오류:', error);
      setTimeout(() => {
        if (isAuthenticated) reconnect();
      }, 5000);
    },
    reconnectInterval: 180000,
    maxReconnectAttempts: 10,
    enabled: isAuthenticated && isTabActive,
  });

  useEffect(() => {
    if (isAuthenticated && isTabActive && !isConnected) {
      reconnect();
    }
  }, [isAuthenticated, isTabActive, isConnected, reconnect]);

  useEffect(() => {
    if (isAuthenticated && isTabActive) {
      loadUnreadNotifications();
    }
  }, [isTabActive, isAuthenticated, loadUnreadNotifications]);

  return (
    <>
      <SSEHandler showToast={showToast} lastMessage={lastMessage} />
      {children}
    </>
  );
}

export default SSEManager;
