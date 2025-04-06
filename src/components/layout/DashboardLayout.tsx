'use client';

import type React from 'react';
import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  User,
  Home,
  Users,
  FileText,
  MessageSquare,
  ChevronDown,
  Send,
} from 'react-feather';
import { useAuth } from '../../context/useAuth';
import { useToast } from '../../context/useToast';
import LogoWithText from '../LogoWithText';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    alert('로그아웃 버튼 클릭');
    const success = await signOut();
    console.log(success);
    if (success) {
      showToast('로그아웃 되었습니다.', 'success');
      navigate('/signin');
    } else {
      showToast('로그아웃 중 오류가 발생했습니다.', 'error');
    }
  };

  const menuItems = [
    { name: '대시보드', icon: <Home size={18} />, href: '/dashboard' },
    { name: '고객 관리', icon: <Users size={18} />, href: '/customers' },
    { name: '매물 관리', icon: <FileText size={18} />, href: '/properties' },
    { name: '계약 관리', icon: <FileText size={18} />, href: '/contracts' },
    { name: '상담/문의', icon: <MessageSquare size={18} />, href: '/consultations' },
    {
      name: '문자 관리',
      icon: <Send size={18} />,
      href: '/sms',
      subItems: [
        { name: '문자 목록', href: '/sms' },
        { name: '문자 보내기', href: '/sms/send' },
        { name: '템플릿 목록', href: '/sms/templates' },
        { name: '템플릿 생성', href: '/sms/templates/create' },
      ],
    },
    {
      name: '문의 템플릿',
      icon: <FileText size={18} />,
      href: '/inquiry-templates',
      subItems: [
        { name: '템플릿 목록', href: '/inquiry-templates' },
        { name: '템플릿 생성', href: '/inquiry-templates/create' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 상단 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* 로고 및 모바일 메뉴 버튼 */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <LogoWithText width={160} height={40} />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {/* 데스크톱 네비게이션 */}
                {menuItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* 사용자 정보 및 알림 */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {/* 알림 버튼 */}
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="sr-only">알림 보기</span>
                <Bell size={20} />
              </button>

              {/* 사용자 드롭다운 */}
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    id="user-menu-button"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <span className="sr-only">사용자 메뉴 열기</span>
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
                      {user?.name ? user.name.charAt(0) : <User size={16} />}
                    </div>
                    <span className="text-gray-700 font-medium">{user?.name || '사용자'}</span>
                    <ChevronDown size={16} className="ml-1 text-gray-400" />
                  </button>
                </div>

                {userMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex={-1}
                  >
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      내 프로필
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      설정
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">메뉴 열기</span>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="sm:hidden" id="mobile-menu">
            <div className="pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    }`
                  }
                >
                  <div className="flex items-center">
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </div>
                </NavLink>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                    {user?.name ? user.name.charAt(0) : <User size={20} />}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.name || '사용자'}
                  </div>
                  <div className="text-sm font-medium text-gray-500">{user?.email || ''}</div>
                </div>
                <button className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span className="sr-only">알림 보기</span>
                  <Bell size={20} />
                </button>
              </div>
              <div className="mt-3 space-y-1">
                <a
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  내 프로필
                </a>
                <a
                  href="/settings"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  설정
                </a>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 메인 콘텐츠 */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
