'use client';

import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';
import { Bell, Check, Trash2, ExternalLink } from 'react-feather';
import Button from '../ui/Button';
import { Notification } from '../../types/notification';

type FilterType = 'all' | 'unread' | 'read';

interface NotificationListProps {
  maxHeight?: string;
  onClose?: () => void;
  maxItems?: number;
  isModal?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  maxHeight = '400px',
  onClose,
  maxItems = 5,
  isModal = true,
}) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotification();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification: Notification) => {
    // 링크가 있으면 해당 링크로 이동
    if (notification.url) {
      window.location.href = notification.url;
    }

    // 알림 목록 닫기 (선택적)
    if (onClose) {
      onClose();
    }
  };

  // 모든 알림 보기 페이지로 이동
  const handleViewAllNotifications = () => {
    if (onClose) {
      onClose();
    }
    navigate('/notifications');
  };

  // 필터링된 알림 목록
  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.isRead;
    if (activeFilter === 'read') return notification.isRead;
    return true;
  });

  // 모달일 경우 최대 표시 개수 제한
  const displayedNotifications = isModal
    ? filteredNotifications.slice(0, maxItems)
    : filteredNotifications;

  return (
    <div className="w-full bg-white rounded-md shadow-lg overflow-hidden">
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <div className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-medium">알림</h3>
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-white hover:bg-blue-700"
              title="모두 읽음으로 표시"
            >
              <Check size={16} className="mr-1" />
              <span className="text-xs">모두 읽음</span>
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllNotifications}
              className="text-white hover:bg-blue-700"
              title="모든 알림 삭제"
            >
              <Trash2 size={16} className="mr-1" />
              <span className="text-xs">모두 삭제</span>
            </Button>
          )}
        </div>
      </div>

      {/* 필터 탭 추가 */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeFilter === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveFilter('all')}
        >
          전체
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeFilter === 'unread'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveFilter('unread')}
        >
          읽지 않음 {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeFilter === 'read'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveFilter('read')}
        >
          읽음
        </button>
      </div>

      <div className="overflow-y-auto p-2" style={{ maxHeight }}>
        {displayedNotifications.length > 0 ? (
          displayedNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onMarkAsUnread={markAsUnread}
              onRemove={removeNotification}
              onClick={handleNotificationClick}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>
              {activeFilter === 'all'
                ? '새로운 알림이 없습니다'
                : activeFilter === 'unread'
                  ? '읽지 않은 알림이 없습니다'
                  : '읽은 알림이 없습니다'}
            </p>
          </div>
        )}
      </div>

      {/* 모달일 경우에만 "모든 알림 보기" 버튼 표시 */}
      {isModal && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full text-blue-600 hover:bg-blue-50"
            onClick={handleViewAllNotifications}
          >
            <ExternalLink size={16} className="mr-2" />
            모든 알림 보기
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
