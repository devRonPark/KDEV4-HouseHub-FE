'use client';

import type React from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  FileText,
  MessageSquare,
  Mail,
  Menu,
  X,
  Bell,
  ChevronDown,
} from 'react-feather';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 임시 사용자 데이터
  const user = {
    name: '김부동 공인중개사',
    role: '공인중개사',
    notifications: 3,
  };

  const navigationItems = [
    { name: '대시보드', path: '/dashboard', icon: <Home size={20} /> },
    { name: '고객 관리', path: '/customers', icon: <Users size={20} /> },
    { name: '매물 관리', path: '/properties', icon: <FileText size={20} /> },
    { name: '상담 내역', path: '/consultations', icon: <MessageSquare size={20} /> },
    { name: '문의 내역', path: '/inquiries', icon: <MessageSquare size={20} /> },
    { name: '문자 관리', path: '/messages', icon: <Mail size={20} /> },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    // 로그아웃 처리
    navigate('/signin');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 사이드바 */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center">
            <img src="/placeholder.svg?height=32&width=32" alt="Logo" className="h-8 w-8 mr-2" />
            <span className="text-xl font-semibold text-blue-600">부동산 CRM</span>
          </Link>
          <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* 헤더 */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>

            <div className="flex items-center ml-auto">
              <button className="p-1 text-gray-500 hover:text-gray-700 relative">
                <Bell size={20} />
                {user.notifications > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center transform translate-x-1 -translate-y-1">
                    {user.notifications}
                  </span>
                )}
              </button>

              <div className="ml-3 relative">
                <div>
                  <button
                    className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={toggleProfileMenu}
                  >
                    <img
                      className="h-8 w-8 rounded-full"
                      src="/placeholder.svg?height=32&width=32"
                      alt="User avatar"
                    />
                    <span className="ml-2 text-gray-700">{user.name}</span>
                    <span className="ml-1 text-gray-500 text-xs">{user.role}</span>
                    <ChevronDown size={16} className="ml-1 text-gray-500" />
                  </button>
                </div>

                {isProfileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        내 프로필
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        설정
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
