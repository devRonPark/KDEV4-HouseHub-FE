'use client';

import type React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Info, AlertTriangle, CheckCircle, AlertCircle, X, Mail } from 'react-feather';
import type { Notification } from '../../types/notification';
import { NotificationType } from '../../types/notification';
import Button from '../ui/Button';
import { MailOpen } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onMarkAsUnread: (id: number) => void;
  onRemove: (id: number) => void;
  onClick?: (notification: Notification) => void;
  isSelected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onRemove,
  onClick,
  isSelected = false,
  onSelect,
}) => {
  // 알림 타입에 따른 아이콘 선택
  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.INFO:
        return <Info className="h-5 w-5 text-blue-500" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case NotificationType.SUCCESS:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case NotificationType.ERROR:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // 알림 타입에 따른 배경색 선택
  const getBgColor = () => {
    if (notification.isRead) return 'bg-white';

    switch (notification.type) {
      case NotificationType.INFO:
        return 'bg-blue-50';
      case NotificationType.WARNING:
        return 'bg-yellow-50';
      case NotificationType.SUCCESS:
        return 'bg-green-50';
      case NotificationType.ERROR:
        return 'bg-red-50';
      default:
        return 'bg-blue-50';
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ko });
    } catch {
      return dateString;
    }
  };

  // 알림 클릭 핸들러
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    if (onClick) {
      onClick(notification);
    }
  };

  // 알림 삭제 핸들러
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(notification.id);
  };

  // 읽음/읽지 않음 토글 핸들러
  const handleToggleReadStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.isRead) {
      onMarkAsUnread(notification.id);
    } else {
      onMarkAsRead(notification.id);
    }
  };

  // 선택 핸들러
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(notification.id, e.target.checked);
    }
  };

  return (
    <div
      className={`${getBgColor()} p-4 rounded-md shadow-sm hover:bg-gray-50 transition-colors duration-150 relative mb-2 ${
        notification.isRead ? 'border border-gray-100' : 'border border-blue-100'
      }`}
    >
      <div className="flex items-center">
        {/* 체크박스 추가 */}
        {onSelect && (
          <div className="mr-3" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelect}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        )}

        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1" onClick={handleClick}>
          <div
            className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}
          >
            {notification.content}
          </div>
          <div className="mt-2 text-xs text-gray-500">{formatDate(notification.createdAt)}</div>
        </div>

        {/* 읽음/읽지 않음 토글 버튼 */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleReadStatus}
            title={notification.isRead ? '읽지 않음으로 표시' : '읽음으로 표시'}
            className="text-gray-400 hover:text-blue-600"
          >
            {notification.isRead ? <MailOpen size={16} /> : <Mail size={16} />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            title="알림 삭제"
            className="text-gray-400 hover:text-red-600"
          >
            <X size={16} />
          </Button>
        </div>

        {/* 읽지 않음 표시 (파란 점) */}
        {!notification.isRead && (
          <div className="absolute top-2 right-2">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
