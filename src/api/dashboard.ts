import apiClient from './client';
import type { ApiResponse } from '../types/api';
import type {
  DashboardStats,
  Activity,
  Notification,
  ChartData,
  RecentProperty,
} from '../types/dashboard';

// 대시보드 주요 지표 조회
export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  try {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  } catch {
    return {
      success: false,
      error: '대시보드 지표를 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 최근 활동 내역 조회
export const getRecentActivities = async (limit = 10): Promise<ApiResponse<Activity[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<Activity[]>>(
      `/dashboard/activities?limit=${limit}`
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: '최근 활동 내역을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 알림 목록 조회
export const getNotifications = async (limit = 10): Promise<ApiResponse<Notification[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<Notification[]>>(
      `/dashboard/notifications?limit=${limit}`
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: '알림을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 알림 읽음 처리
export const markNotificationAsRead = async (
  notificationId: string
): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.put<ApiResponse<void>>(
      `/dashboard/notifications/${notificationId}/read`
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: '알림 읽음 처리 중 오류가 발생했습니다.',
    };
  }
};

// 모든 알림 읽음 처리
export const markAllNotificationsAsRead = async (): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.put<ApiResponse<void>>('/dashboard/notifications/read-all');
    return response.data;
  } catch {
    return {
      success: false,
      error: '모든 알림 읽음 처리 중 오류가 발생했습니다.',
    };
  }
};

// 최근 등록 매물 조회 API
export const getRecentProperties = async (limit = 5): Promise<ApiResponse<RecentProperty[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<RecentProperty[]>>(
      `/dashboard/properties/recent?limit=${limit}`
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: '최근 매물 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
};

// 차트 데이터 조회 API
export const getChartData = async (
  chartType: 'properties' | 'contracts'
): Promise<ApiResponse<ChartData>> => {
  try {
    const response = await apiClient.get<ApiResponse<ChartData>>(`/dashboard/charts/${chartType}`);
    return response.data;
  } catch {
    return {
      success: false,
      error: '차트 데이터를 불러오는 중 오류가 발생했습니다.',
    };
  }
};
