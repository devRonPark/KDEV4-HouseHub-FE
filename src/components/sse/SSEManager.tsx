import { useState, useCallback, useEffect } from 'react';
import useSSE from '../../hooks/useSSE';
import SSEHandler from './SSEHandler';
import { useAuth } from '../../context/useAuth';
import { useToast } from '../../context/useToast';
import { NotificationProvider } from '../../context/NotificationContext';

function SSEManager({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [isTabActive, setIsTabActive] = useState<boolean>(
    () => document.visibilityState === 'visible'
  );

  // 탭 활성화/비활성화 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSSEMessage = useCallback((event: MessageEvent) => {
    setLastMessage(event);
  }, []);

  // SSE 연결 및 메시지 처리
  const { isConnected } = useSSE({
    url: `https://www.house-hub.store:8443/api/notifications/sse/connect`,
    withCredentials: true,
    onMessage: handleSSEMessage,
    onError: (error) => console.error('SSE 오류:', error),
    reconnectInterval: 180000,
    maxReconnectAttempts: 10,
    enabled: isAuthenticated && isTabActive,
  });

  if (!isAuthenticated || !isConnected) {
    return <NotificationProvider>{children}</NotificationProvider>;
  }

  return (
    <NotificationProvider>
      <SSEHandler showToast={showToast} lastMessage={lastMessage} />
      {children}
    </NotificationProvider>
  );
}

export default SSEManager;
