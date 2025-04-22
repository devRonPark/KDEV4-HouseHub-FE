'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Bell } from 'react-feather';
import { useNotification } from '../../context/NotificationContext';
import NotificationList from './NotificationList';
import useOnClickOutside from '../../hooks/useOnClickOutside';

interface NotificationBadgeProps {
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotification();
  const notificationRef = useRef<HTMLDivElement>(null!);

  // 외부 클릭 감지
  useOnClickOutside(notificationRef, () => setIsOpen(false));

  // 알림 목록 토글
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  // 알림 목록 닫기
  const closeNotifications = () => {
    setIsOpen(false);
  };

  // ESC 키 누르면 알림 목록 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <div ref={notificationRef} className={`relative ${className}`}>
      <button
        className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
        onClick={toggleNotifications}
        aria-label="알림"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50">
          <NotificationList onClose={closeNotifications} isModal={true} maxItems={5} />
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;
