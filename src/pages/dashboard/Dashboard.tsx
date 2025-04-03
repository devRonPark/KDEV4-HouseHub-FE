'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Users, Home, MessageSquare, HelpCircle, Bell, RefreshCw } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import ActivityItem from '../../components/dashboard/ActivityItem';
import NotificationItem from '../../components/dashboard/NotificationItem';
import ChartContainer from '../../components/dashboard/ChartContainer';
import { useToast } from '../../context/ToastContext';
import {
  getDashboardStats,
  getRecentActivities,
  getNotifications,
  markNotificationAsRead,
  getChartData,
} from '../../api/dashboard';
import { getMyProfile } from '../../api/agent';
import type { DashboardStats, Activity, Notification, ChartData } from '../../types/dashboard';
import type { AgentDetail } from '../../types/agent';

const Dashboard: React.FC = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userProfile, setUserProfile] = useState<AgentDetail | null>(null);
  const [customerChartData, setCustomerChartData] = useState<ChartData | null>(null);
  const [propertyChartData, setPropertyChartData] = useState<ChartData | null>(null);

  // 데이터 로딩 함수
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 병렬로 여러 API 호출
      const [statsResponse, activitiesResponse, notificationsResponse, profileResponse] =
        await Promise.all([
          getDashboardStats(),
          getRecentActivities(5),
          getNotifications(5),
          getMyProfile(),
        ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        showToast(statsResponse.error || '대시보드 지표를 불러오는데 실패했습니다.', 'error');
      }

      if (activitiesResponse.success && activitiesResponse.data) {
        setActivities(activitiesResponse.data);
      } else {
        showToast(activitiesResponse.error || '최근 활동을 불러오는데 실패했습니다.', 'error');
      }

      if (notificationsResponse.success && notificationsResponse.data) {
        setNotifications(notificationsResponse.data);
      } else {
        showToast(notificationsResponse.error || '알림을 불러오는데 실패했습니다.', 'error');
      }

      if (profileResponse.success && profileResponse.data) {
        setUserProfile(profileResponse.data);
      } else {
        showToast(profileResponse.error || '프로필 정보를 불러오는데 실패했습니다.', 'error');
      }

      // 차트 데이터 로딩
      const customerChartResponse = await getChartData('customers', 'month');
      if (customerChartResponse.success && customerChartResponse.data) {
        setCustomerChartData(customerChartResponse.data);
      }

      const propertyChartResponse = await getChartData('properties', 'month');
      if (propertyChartResponse.success && propertyChartResponse.data) {
        setPropertyChartData(propertyChartResponse.data);
      }
    } catch (error) {
      showToast('데이터를 불러오는 중 오류가 발생했습니다.', 'error');
      console.error('Dashboard data loading error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // 알림 읽음 처리 함수
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await markNotificationAsRead(notificationId);
      if (response.success) {
        // 알림 목록 업데이트
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === notificationId ? { ...notification, isRead: true } : notification
          )
        );
      } else {
        showToast(response.error || '알림 읽음 처리에 실패했습니다.', 'error');
      }
    } catch (error) {
      showToast('알림 읽음 처리 중 오류가 발생했습니다.', 'error');
    }
  };

  // 초기 데이터 로딩
  // useEffect(() => {
  //   loadDashboardData();
  // }, [loadDashboardData]);

  // 숫자 포맷팅 함수
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={loadDashboardData}
            disabled={isLoading}
          >
            <RefreshCw className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            새로고침
          </button>
        </div>
      </div>

      {/* 환영 메시지 */}
      {userProfile && (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              안녕하세요, {userProfile.name}님!
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {userProfile.realEstate?.name
                ? `${userProfile.realEstate.name}에서 오늘도 좋은 하루 되세요.`
                : '오늘도 좋은 하루 되세요.'}
            </p>
          </div>
        </div>
      )}

      {/* 주요 지표 */}
      {stats && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="고객 수"
            value={stats.customers.total}
            change={stats.customers.percentChange}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            formatter={formatNumber}
          />
          <StatCard
            title="매물 수"
            value={stats.properties.total}
            change={stats.properties.percentChange}
            icon={<Home className="h-6 w-6 text-green-600" />}
            formatter={formatNumber}
          />
          <StatCard
            title="상담 건수"
            value={stats.consultations.total}
            change={stats.consultations.percentChange}
            icon={<MessageSquare className="h-6 w-6 text-purple-600" />}
            formatter={formatNumber}
          />
          <StatCard
            title="문의 건수"
            value={stats.inquiries.total}
            change={stats.inquiries.percentChange}
            icon={<HelpCircle className="h-6 w-6 text-yellow-600" />}
            formatter={formatNumber}
          />
        </div>
      )}

      {/* 차트 및 그래프 */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {customerChartData && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">고객 추이</h3>
              <div className="mt-2">
                <ChartContainer data={customerChartData} type="line" height={250} />
              </div>
            </div>
          </div>
        )}

        {propertyChartData && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">매물 추이</h3>
              <div className="mt-2">
                <ChartContainer data={propertyChartData} type="bar" height={250} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 최근 활동 및 알림 */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* 최근 활동 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">최근 활동</h3>
            <a href="/activities" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              모두 보기
            </a>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length > 0 ? (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {activities.map((activity, activityIdx) => (
                      <li key={activity.id}>
                        <ActivityItem activity={activity} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">최근 활동이 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* 알림 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">알림</h3>
              <div className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {notifications.filter((n) => !n.isRead).length}
              </div>
            </div>
            <a
              href="/notifications"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              모두 보기
            </a>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">알림 없음</h3>
                  <p className="mt-1 text-sm text-gray-500">현재 새로운 알림이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
