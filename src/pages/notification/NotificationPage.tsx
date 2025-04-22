'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Trash2, Mail, CheckSquare } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/useToast';
import { useNotification } from '../../context/NotificationContext';
import NotificationItem from '../../components/notification/NotificationItem';
import type { Notification, NotificationFilter } from '../../types/notification';
import { useNavigate } from 'react-router-dom';
import { MailOpen } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    loadNotifications,
    markMultipleAsRead,
    markMultipleAsUnread,
    markAllAsRead,
    removeNotification,
    removeMultipleNotifications,
    clearAllNotifications,
    unreadCount,
    markAsRead,
    markAsUnread,
  } = useNotification();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationFilter>({
    filter: 'all',
    page: 1,
    size: 10,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalElements: 10,
    size: 10,
  });
  // 선택된 알림 ID 목록
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  // 전체 선택 상태
  const [selectAll, setSelectAll] = useState(false);

  // 알림 목록 로드
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await loadNotifications(filter);
      if (result) {
        setNotifications(result.content);
        setPagination(result.pagination);
        setSelectAll(false); // 알림 목록 로드 후 전체 선택 해제
        setSelectedNotifications([]); // 알림 목록 로드 후 선택된 알림 ID 목록 초기화
      } else {
        showToast('알림 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('알림 목록을 불러오는 중 오류가 발생했습니다:', error);
      showToast('알림 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filter, showToast, loadNotifications]);

  // 컴포넌트 마운트 시 알림 목록 로드
  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  // 필터 변경 핸들러
  const handleFilterChange = (filter: 'all' | 'read' | 'unread') => {
    setFilter((prev) => ({
      ...prev,
      filter,
      page: 1,
    }));
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setFilter((prev) => ({
      ...prev,
      page,
    }));
  };

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification: Notification) => {
    // 링크가 있으면 해당 링크로 이동
    if (notification.url) {
      navigate(notification.url);
    }
  };

  // 모든 알림 읽음 처리 핸들러
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      showToast('모든 알림을 읽음으로 표시했습니다.', 'success');
      // 알림 목록 새로고침
      setFilter((prev) => ({
        ...prev,
        page: 1,
      }));
    } catch {
      showToast('알림 읽음 처리 중 오류가 발생했습니다.', 'error');
    }
  };

  // 모든 알림 삭제 핸들러
  const handleClearAllNotifications = async () => {
    try {
      await clearAllNotifications();
      showToast('모든 알림이 삭제되었습니다.', 'success');
      setNotifications([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalElements: 0,
        size: 10,
      });
    } catch {
      showToast('알림 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  // 알림 선택 핸들러
  const handleSelectNotification = (id: number, selected: boolean) => {
    if (selected) {
      setSelectedNotifications((prev) => [...prev, id]);
    } else {
      setSelectedNotifications((prev) => prev.filter((notificationId) => notificationId !== id));
    }
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = () => {
    if (selectAll) {
      // 전체 해제
      setSelectedNotifications([]);
    } else {
      // 전체 선택
      setSelectedNotifications(notifications.map((notification) => notification.id));
    }
    setSelectAll(!selectAll);
  };

  // 선택한 알림 읽음 처리 핸들러
  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length === 0) {
      showToast('선택된 알림이 없습니다.', 'warning');
      return;
    }

    try {
      await markMultipleAsRead(selectedNotifications);
      showToast(`${selectedNotifications.length}개의 알림을 읽음으로 표시했습니다.`, 'success');
      // 알림 목록 새로고침
      setFilter((prev) => ({
        ...prev,
        page: pagination.currentPage,
      }));
    } catch {
      showToast('알림 읽음 처리 중 오류가 발생했습니다.', 'error');
    }
  };

  // 선택한 알림 읽지 않음 처리 핸들러
  const handleMarkSelectedAsUnread = async () => {
    if (selectedNotifications.length === 0) {
      showToast('선택된 알림이 없습니다.', 'warning');
      return;
    }

    try {
      await markMultipleAsUnread(selectedNotifications);
      showToast(
        `${selectedNotifications.length}개의 알림을 읽지 않음으로 표시했습니다.`,
        'success'
      );
      // 알림 목록 새로고침
      setFilter((prev) => ({
        ...prev,
        page: pagination.currentPage,
      }));
    } catch {
      showToast('알림 읽지 않음 처리 중 오류가 발생했습니다.', 'error');
    }
  };

  // 선택한 알림 삭제 핸들러
  const handleRemoveSelected = async () => {
    if (selectedNotifications.length === 0) {
      showToast('선택된 알림이 없습니다.', 'warning');
      return;
    }

    try {
      await removeMultipleNotifications(selectedNotifications);
      showToast(`${selectedNotifications.length}개의 알림이 삭제되었습니다.`, 'success');
      // 알림 목록 새로고침
    } catch {
      showToast('알림 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="pb-5 mb-6 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">알림 관리</h1>
        <div className="mt-3 sm:mt-0 flex space-x-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center"
            >
              <Check className="mr-2 h-4 w-4" />
              모두 읽음으로 표시
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAllNotifications}
              className="inline-flex items-center"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              모든 알림 삭제
            </Button>
          )}
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="mb-4">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              filter.filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleFilterChange('all')}
          >
            전체 {notifications.length > 0 && `(${notifications.length})`}
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              filter.filter === 'unread'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleFilterChange('unread')}
          >
            읽지 않음 {unreadCount > 0 ? `(${unreadCount})` : `(0)`}
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              filter.filter === 'read'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleFilterChange('read')}
          >
            읽음{' '}
            {notifications.length - unreadCount > 0 && `(${notifications.length - unreadCount})`}
          </button>
        </div>
      </div>

      {/* 선택된 알림 일괄 처리 버튼 */}
      {notifications.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="ghost" onClick={handleSelectAll} className="inline-flex items-center">
            <CheckSquare className="mr-2 h-4 w-4" />
            {selectAll ? '전체 선택 해제' : '전체 선택'}
          </Button>

          {selectedNotifications.length > 0 && (
            <>
              <Button
                variant="ghost"
                onClick={handleMarkSelectedAsRead}
                className="inline-flex items-center"
              >
                <Mail className="mr-2 h-4 w-4" />
                선택 항목 읽음으로 표시
              </Button>

              <Button
                variant="ghost"
                onClick={handleMarkSelectedAsUnread}
                className="inline-flex items-center"
              >
                <MailOpen className="mr-2 h-4 w-4" />
                선택 항목 읽지 않음으로 표시
              </Button>

              <Button
                variant="ghost"
                onClick={handleRemoveSelected}
                className="inline-flex items-center text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                선택 항목 삭제
              </Button>
            </>
          )}

          {selectedNotifications.length > 0 && (
            <span className="ml-2 text-sm text-gray-500 self-center">
              {selectedNotifications.length}개 선택됨
            </span>
          )}
        </div>
      )}

      {/* 알림 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {isLoading && notifications.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">알림이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter.filter === 'all'
                ? '새로운 알림이 없습니다.'
                : filter.filter === 'unread'
                  ? '읽지 않은 알림이 없습니다.'
                  : '읽은 알림이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-2">
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onMarkAsUnread={markAsUnread}
                  onRemove={removeNotification}
                  onClick={handleNotificationClick}
                  isSelected={selectedNotifications.includes(notification.id)}
                  onSelect={handleSelectNotification}
                />
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {!isLoading && notifications.length > 0 && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  전체 <span className="font-medium">{pagination.totalElements}</span> 개 중{' '}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * pagination.size + 1}
                  </span>{' '}
                  -{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.size, pagination.totalElements)}
                  </span>{' '}
                  표시
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">이전</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.currentPage === pagination.totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">다음</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
