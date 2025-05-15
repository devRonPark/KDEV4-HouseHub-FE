'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { Notification, NotificationFilter } from '../types/notification';
import {
  deleteNotifications,
  getNotifications,
  getUnreadNotifications,
  markNotificationsAsRead,
  markNotificationsAsUnread,
} from '../api/notification';
import { useLocation } from 'react-router-dom';

interface NotificationContextType {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  unreadCount: number;
  loadNotifications: (filter: NotificationFilter) => Promise<{
    content: Notification[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalElements: number;
      size: number;
    };
  } | null>;
  loadUnreadNotifications: () => Promise<void>;
  markAsRead: (notification: Notification) => Promise<void>;
  markAsUnread: (notification: Notification) => Promise<void>;
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
  setNotifications: () => {},
  unreadCount: 0,
  loadNotifications: async () => null,
  loadUnreadNotifications: async () => {},
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
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isAuthenticated } = useAuth();
  const [isNotificationsLoaded, setIsNotificationsLoaded] = useState(false);

  // 읽지 않은 알림 개수 계산
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  // 알림 목록 로드 (페이지네이션 및 필터링 지원)
  const loadNotifications = useCallback(
    async (filter: NotificationFilter) => {
      try {
        const response = await getNotifications({ ...filter, filter: 'all' });
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

  // 읽지 않은 알림 목록 로드
  const loadUnreadNotifications = useCallback(async () => {
    try {
      console.log('읽지 않은 알림 동기화 시작');
      const response = await getUnreadNotifications();
      if (response.success && response.data) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((notification) => notification.id));
          const newNotifications = response.data?.filter(
            (notification) => !existingIds.has(notification.id)
          );

          if ((newNotifications ?? []).length > 0) {
            console.log(`${(newNotifications ?? []).length}개의 읽지 않은 알림 동기화됨`);
            return [...(newNotifications ?? []), ...prev];
          }
          return prev;
        });
      } else {
        console.error('읽지 않은 알림 로드 실패:', response.error);
      }
    } catch (error) {
      console.error('읽지 않은 알림 로드 중 오류:', error);
    }
  }, [setNotifications]);

  // 알림을 읽음으로 표시
  const markAsRead = useCallback(async (notification: Notification) => {
    try {
      const response = await markNotificationsAsRead([notification.id], false);
      if (response.success) {
        console.log('알림 읽음 처리 성공:', response.data);
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === response.data?.notificationIds[0]
              ? { ...notification, isRead: true }
              : notification
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
  const markAsUnread = useCallback(async (notification: Notification) => {
    try {
      const response = await markNotificationsAsUnread([notification.id], false);
      if (response.success && response.data) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === response.data?.notificationIds[0]
              ? { ...notification, isRead: false }
              : notification
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
    const isDashboard = location.pathname.startsWith('/dashboard');

    if (!isNotificationsLoaded && isAuthenticated && !isDashboard) {
      loadNotifications({
        filter: 'all',
        page: 1,
        size: 5,
      });
      setIsNotificationsLoaded(true);
    }
  }, [location.pathname, isNotificationsLoaded]);

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
        setNotifications,
        unreadCount,
        loadNotifications,
        loadUnreadNotifications,
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
