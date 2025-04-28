'use client';

import type React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Notification } from '../../types/dashboard';
import { Info, AlertTriangle, CheckCircle, AlertCircle } from 'react-feather';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    if (notification.isRead) return 'bg-white';
    return 'bg-blue-50';
  };

  return (
    <div
      className={`${getBgColor()} p-4 rounded-md shadow-sm hover:bg-gray-50 transition-colors duration-150`}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <div className="text-sm font-medium text-gray-900">{notification.title}</div>
          <div className="mt-1 text-sm text-gray-600">{notification.message}</div>
          <div className="mt-2 text-xs text-gray-500">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ko })}
          </div>
        </div>
        {!notification.isRead && (
          <div className="ml-2 flex-shrink-0">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
