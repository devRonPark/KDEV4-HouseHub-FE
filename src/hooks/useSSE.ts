'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { NotificationEvent } from '../types/notification';

interface UseSSEOptions {
  url: string;
  onMessage: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

/**
 * SSE(Server-Sent Events) 연결을 관리하는 훅
 * event-source-polyfill을 사용하여 브라우저 호환성 향상
 */
const useSSE = ({
  url,
  onMessage,
  onError,
  onOpen,
  reconnectInterval = 20000,
  maxReconnectAttempts = 5,
  headers = {},
  withCredentials = true,
}: UseSSEOptions & { userId?: string | null }) => {
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // SSE 연결 함수
  const connect = useCallback(() => {
    if (eventSourceRef.current || isConnected) {
      return;
    }

    try {
      const options = {
        headers,
        withCredentials,
      };

      const eventSource = new EventSourcePolyfill(url, options);
      eventSourceRef.current = eventSource;

      eventSource.onopen = (event) => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        onOpen?.(event as unknown as Event);
      };

      eventSource.onmessage = (event) => {
        onMessage(event as MessageEvent<NotificationEvent>);
      };

      eventSource.onerror = (event) => {
        setIsConnected(false);
        eventSource.close();
        eventSourceRef.current = null;

        onError?.(event as unknown as Event);

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, reconnectInterval);
        }
      };
    } catch {
      setIsConnected(false);

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connect();
        }, reconnectInterval);
      }
    }
  }, [
    url,
    onMessage,
    onError,
    onOpen,
    reconnectInterval,
    maxReconnectAttempts,
    headers,
    withCredentials,
    isConnected,
  ]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // ✅ userId가 존재할 때만 연결 시도
  useEffect(() => {
    if (!eventSourceRef.current && !isConnected) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, isConnected]);

  return {
    isConnected,
    reconnectAttempts: reconnectAttemptsRef.current,
    connect,
    disconnect,
  };
};

export default useSSE;
