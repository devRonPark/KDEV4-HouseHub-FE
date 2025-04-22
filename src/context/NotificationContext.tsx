'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useSSE from '../hooks/useSSE';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import type { Notification, NotificationEvent, NotificationFilter } from '../types/notification';
import {
  deleteNotifications,
  getNotifications,
  markNotificationsAsRead,
  markNotificationsAsUnread,
} from '../api/notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  loadNotifications: (filter: NotificationFilter) => Promise<{
    content: Notification[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalElements: number;
      size: number;
    };
  } | null>;
  markAsRead: (id: number) => Promise<void>;
  markAsUnread: (id: number) => Promise<void>;
  markMultipleAsRead: (ids: number[]) => Promise<void>;
  markMultipleAsUnread: (ids: number[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAllAsUnread: () => Promise<void>;
  removeNotification: (id: number) => Promise<void>;
  removeMultipleNotifications: (ids: number[]) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  loadNotifications: async () => null,
  markAsRead: async () => {},
  markAsUnread: async () => {},
  markMultipleAsRead: async () => {},
  markMultipleAsUnread: async () => {},
  markAllAsRead: async () => {},
  markAllAsUnread: async () => {},
  removeNotification: async () => {},
  removeMultipleNotifications: async () => {},
  clearAllNotifications: async () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // 읽지 않은 알림 개수 계산
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  // SSE 메시지 핸들러
  const handleSSEMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data: NotificationEvent = JSON.parse(event.data);
        console.log('SSE 알림 수신:', data);

        // 알림 객체 생성
        const newNotification: Notification = {
          id: data.id,
          type: data.type,
          content: data.content,
          url: data.url,
          isRead: data.isRead,
          createdAt: data.createdAt,
          receiverId: data.receiverId,
        };

        // 알림 추가 (중복 방지)
        setNotifications((prev) => {
          // 이미 같은 ID의 알림이 있는지 확인
          const exists = prev.some((item) => item.id === newNotification.id);
          if (exists) {
            return prev;
          }
          // 새 알림 추가 (최신 알림이 맨 위에 오도록)
          return [newNotification, ...prev];
        });

        // 토스트 알림 표시
        showToast(data.content, 'info');

        // 브라우저 알림 표시 (선택적)
        if (Notification.permission === 'granted') {
          new Notification('새 문의 알림', {
            body: data.content,
          });
        }
      } catch (error) {
        console.error('SSE 메시지 처리 중 오류:', error);
      }
    },
    [showToast]
  );

  // SSE 연결 설정
  const { isConnected } = useSSE({
    url: `http://localhost:8080/api/notifications/sse/connect`,
    withCredentials: true, // 쿠키 기반 인증을 사용하는 경우
    onMessage: handleSSEMessage,
    onError: (error) => console.error('SSE 연결 오류:', error),
    reconnectInterval: 180000,
    maxReconnectAttempts: 10,
  });

  // 알림 목록 로드 (페이지네이션 및 필터링 지원)
  const loadNotifications = useCallback(
    async (filter: NotificationFilter) => {
      try {
        const response = await getNotifications(filter);
        if (response.success && response.data) {
          // 첫 페이지인 경우 알림 목록 교체, 그렇지 않은 경우 추가
          if (response.data.pagination.currentPage === 1) {
            setNotifications(response.data.content);
          } else {
            // 중복 방지를 위해 ID 기준으로 필터링
            const existingIds = new Set(notifications.map((n) => n.id));
            const newNotifications = response.data.content.filter((n) => !existingIds.has(n.id));
            setNotifications((prev) => [...prev, ...newNotifications]);
          }
          return response.data;
        } else {
          console.error('알림 목록 로드 실패:', response.error);
          return null;
        }
      } catch (error) {
        console.error('알림 목록 로드 중 오류:', error);
        return null;
      }
    },
    [notifications]
  );

  // 알림을 읽음으로 표시
  const markAsRead = useCallback(async (id: number) => {
    try {
      const response = await markNotificationsAsRead([id], false);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id ? { ...notification, isRead: true } : notification
          )
        );
      } else {
        console.error('알림 읽음 처리 실패:', response.error);
      }
    } catch (error) {
      console.error('알림 읽음 처리 중 오류:', error);
    }
  }, []);

  // 단일 알림을 읽지 않음으로 표시 (내부적으로 배열 API 사용)
  const markAsUnread = useCallback(async (id: number) => {
    try {
      const response = await markNotificationsAsUnread([id], false);
      if (response.success && response.data) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id ? { ...notification, isRead: false } : notification
          )
        );
      } else {
        console.error('알림 읽지 않음 처리 실패:', response.error);
      }
    } catch (error) {
      console.error('알림 읽지 않음 처리 중 오류:', error);
    }
  }, []);

  // 여러 알림을 읽음으로 표시
  const markMultipleAsRead = useCallback(async (ids: number[]) => {
    if (ids.length === 0) return;

    try {
      const response = await markNotificationsAsRead(ids, false);
      if (response.success && response.data) {
        const updatedIds = response.data.notificationIds || ids;
        setNotifications((prev) =>
          prev.map((notification) =>
            updatedIds.includes(notification.id) ? { ...notification, isRead: true } : notification
          )
        );
      } else {
        console.error('여러 알림 읽음 처리 실패:', response.error);
      }
    } catch (error) {
      console.error('여러 알림 읽음 처리 중 오류:', error);
    }
  }, []);

  // 여러 알림을 읽지 않음으로 표시
  const markMultipleAsUnread = useCallback(async (ids: number[]) => {
    if (ids.length === 0) return;

    try {
      const response = await markNotificationsAsUnread(ids, false);
      if (response.success && response.data) {
        const updatedIds = response.data.notificationIds || ids;
        setNotifications((prev) =>
          prev.map((notification) =>
            updatedIds.includes(notification.id) ? { ...notification, isRead: false } : notification
          )
        );
      } else {
        console.error('여러 알림 읽지 않음 처리 실패:', response.error);
      }
    } catch (error) {
      console.error('여러 알림 읽지 않음 처리 중 오류:', error);
    }
  }, []);

  // 모든 알림을 읽음으로 표시
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await markNotificationsAsRead([], true);
      if (response.success && response.data) {
        const updatedIds = response.data.notificationIds || [];
        if (updatedIds.length > 0) {
          // 특정 ID만 업데이트
          setNotifications((prev) =>
            prev.map((notification) =>
              updatedIds.includes(notification.id)
                ? { ...notification, isRead: true }
                : notification
            )
          );
        } else {
          // 모든 알림 업데이트
          setNotifications((prev) =>
            prev.map((notification) => ({ ...notification, isRead: true }))
          );
        }
      } else {
        console.error('모든 알림 읽음 처리 실패:', response.error);
      }
    } catch (error) {
      console.error('모든 알림 읽음 처리 중 오류:', error);
    }
  }, []);

  // 모든 알림을 읽지 않음으로 표시
  const markAllAsUnread = useCallback(async () => {
    try {
      const response = await markNotificationsAsUnread([], true);
      if (response.success && response.data) {
        const updatedIds = response.data.notificationIds || [];
        if (updatedIds.length > 0) {
          // 특정 ID만 업데이트
          setNotifications((prev) =>
            prev.map((notification) =>
              updatedIds.includes(notification.id)
                ? { ...notification, isRead: false }
                : notification
            )
          );
        } else {
          // 모든 알림 업데이트
          setNotifications((prev) =>
            prev.map((notification) => ({ ...notification, isRead: false }))
          );
        }
      } else {
        console.error('모든 알림 읽지 않음 처리 실패:', response.error);
      }
    } catch (error) {
      console.error('모든 알림 읽음 처리 중 오류:', error);
    }
  }, []);

  // 단일 알림 삭제 (내부적으로 배열 API 사용)
  const removeNotification = useCallback(async (id: number) => {
    try {
      const response = await deleteNotifications([id], false);
      if (response.success && response.data) {
        const deletedIds = response.data.notificationIds || [id];
        setNotifications((prev) =>
          prev.filter((notification) => !deletedIds.includes(notification.id))
        );
      } else {
        console.error('알림 삭제 실패:', response.error);
      }
    } catch (error) {
      console.error('알림 삭제 중 오류:', error);
    }
  }, []);

  // 여러 알림 삭제
  const removeMultipleNotifications = useCallback(async (ids: number[]) => {
    if (ids.length === 0) return;

    try {
      const response = await deleteNotifications(ids, false);
      if (response.success && response.data) {
        const deletedIds = response.data.notificationIds || ids;
        setNotifications((prev) =>
          prev.filter((notification) => !deletedIds.includes(notification.id))
        );
      } else {
        console.error('여러 알림 삭제 실패:', response.error);
      }
    } catch (error) {
      console.error('여러 알림 삭제 중 오류:', error);
    }
  }, []);

  // 모든 알림 삭제
  const clearAllNotifications = useCallback(async () => {
    try {
      const response = await deleteNotifications([], true);
      if (response.success) {
        const deletedIds = response.data?.notificationIds || [];
        if (deletedIds.length > 0) {
          // 특정 ID만 삭제
          setNotifications((prev) =>
            prev.filter((notification) => !deletedIds.includes(notification.id))
          );
        } else {
          // 모든 알림 삭제
          setNotifications([]);
        }
      } else {
        console.error('모든 알림 삭제 실패:', response.error);
      }
    } catch (error) {
      console.error('모든 알림 삭제 중 오류:', error);
    }
  }, []);

  // 초기 알림 데이터 로드
  useEffect(() => {
    loadNotifications({
      filter: 'all',
      page: 1,
      size: 5,
    });
  }, []);

  // 브라우저 알림 권한 요청 (선택적)
  useEffect(() => {
    if (
      isAuthenticated &&
      Notification.permission !== 'granted' &&
      Notification.permission !== 'denied'
    ) {
      Notification.requestPermission();
    }
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        loadNotifications,
        markAsRead,
        markAsUnread,
        markMultipleAsRead,
        markMultipleAsUnread,
        markAllAsRead,
        markAllAsUnread,
        removeNotification,
        removeMultipleNotifications,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
