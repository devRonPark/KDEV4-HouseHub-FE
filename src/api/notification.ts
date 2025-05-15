import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  Notification,
  NotificationFilter,
  NotificationListResponse,
} from '../types/notification';

// 알림 목록 조회 API
export const getNotifications = async (
  filter: NotificationFilter
): Promise<ApiResponse<NotificationListResponse>> => {
  try {
    const params = new URLSearchParams();
    params.append('page', filter.page.toString());
    params.append('size', filter.size.toString());

    if (filter && filter.filter !== 'all') {
      params.append('filter', filter.filter);
    }

    const response = await apiClient.get<ApiResponse<NotificationListResponse>>(
      `/notifications?${params.toString()}`
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: '알림 목록을 불러오는 중 오류가 발생했습니다.',
      data: {
        content: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalElements: 0,
          size: 10,
        },
      },
    };
  }
};

// 읽지 않은 알림 목록 조회 API
export const getUnreadNotifications = async (): Promise<ApiResponse<Notification[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<Notification[]>>(`/notifications/unread`);
    return response.data;
  } catch {
    return {
      success: false,
      error: '읽지 않은 알림 목록을 불러오는 중 오류가 발생했습니다.',
      data: [],
    };
  }
};

// 알림을 읽음으로 표시하는 API 함수
export const markNotificationsAsRead = async (
  notificationIds: number[] = [],
  isAll = false
): Promise<ApiResponse<{ notificationIds: number[] }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ notificationIds: number[] }>>(
      `/notifications/read`,
      {
        notificationIds,
        isAll,
      }
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: '알림 읽음 처리 중 오류가 발생했습니다.',
    };
  }
};

// 알림을 읽지 않음으로 표시하는 API 함수
export const markNotificationsAsUnread = async (
  notificationIds: number[] = [],
  isAll = false
): Promise<ApiResponse<{ notificationIds: number[] }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ notificationIds: number[] }>>(
      `/notifications/unread`,
      {
        notificationIds,
        isAll,
      }
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: '알림 읽지 않음 처리 중 오류가 발생했습니다.',
    };
  }
};

// 알림 삭제 API
export const deleteNotifications = async (
  notificationIds: number[] = [],
  isAll = false
): Promise<ApiResponse<{ notificationIds: number[] }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ notificationIds: number[] }>>(
      `/notifications/delete`,
      {
        notificationIds,
        isAll,
      }
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: '알림 삭제 중 오류가 발생했습니다.',
    };
  }
};
