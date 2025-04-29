'use client';

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem as MuiMenuItem,
  Toolbar,
  Typography,
  Collapse,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  MenuIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExpandIcon as ExpandLess,
  ExpandIcon as ExpandMore,
  CircleIcon as AccountCircle,
  Home,
  Users,
  FileText,
  MessageSquare,
  Send,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useToast } from '../../context/useToast';
import LogoWithText from '../LogoWithText';
import NotificationBadge from '../notification/NotificationBadge';

// 드로어 너비 설정
const drawerWidth = 240;
const collapsedDrawerWidth = 64;

// 메뉴 아이템 타입 정의
type MenuItem = {
  name: string;
  icon: React.ReactNode;
  href: string;
  subItems?: { name: string; href: string }[];
};

// 메뉴 아이템 정의
const menuItems: MenuItem[] = [
  { name: '홈', icon: <Home size={18} />, href: '/dashboard' },
  { name: '고객명부', icon: <Users size={18} />, href: '/customers' },
  { name: '내 매물', icon: <FileText size={18} />, href: '/properties' },
  { name: '외부 매물', icon: <FileText size={18} />, href: '/crawling-properties' },
  { name: '계약 현황', icon: <FileText size={18} />, href: '/contracts' },
  {
    name: '상담 이력',
    icon: <MessageSquare size={18} />,
    href: '/consultations',
    subItems: [
      { name: '상담 목록', href: '/consultations' },
      { name: '상담 등록', href: '/consultations/new' },
    ],
  },
  {
    name: '문자 발송',
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
    name: '문의 양식',
    icon: <FileText size={18} />,
    href: '/inquiry-templates',
    subItems: [
      { name: '양식 목록', href: '/inquiry-templates' },
      { name: '양식 생성', href: '/inquiry-templates/create' },
    ],
  },
  {
    name: '고객 문의',
    icon: <ClipboardList size={18} />,
    href: '/inquiries',
  },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { showToast } = useToast();

  // 상태 관리
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // 현재 경로에 따라 서브메뉴 자동 확장
  useEffect(() => {
    const newExpandedItems: Record<string, boolean> = {};

    menuItems.forEach((item) => {
      if (item.subItems) {
        const shouldExpand = item.subItems.some((subItem) => location.pathname === subItem.href);
        if (shouldExpand) {
          newExpandedItems[item.name] = true;
        }
      }
    });

    setExpandedItems(newExpandedItems);
  }, [location.pathname]);

  // 로컬 스토리지에서 사이드바 상태 불러오기
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      setCollapsed(savedState === 'true');
    }
  }, []);

  // 사이드바 상태 저장
  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  // 모바일 드로어 토글
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // 서브메뉴 토글
  const toggleSubMenu = (name: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // 사용자 메뉴 열기
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // 사용자 메뉴 닫기
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // 로그아웃 처리
  const handleSignOut = async () => {
    handleUserMenuClose();
    alert('로그아웃 버튼 클릭');
    const success = await signOut();
    if (success) {
      showToast('로그아웃 되었습니다.', 'success');
      navigate('/signin');
    } else {
      showToast('로그아웃 중 오류가 발생했습니다.', 'error');
    }
  };

  // 현재 경로가 메뉴 항목과 일치하는지 확인
  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  // 드로어 내용 렌더링
  const renderDrawerContent = () => (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? 1 : 2,
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Link
            to="/dashboard"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          >
            <LogoWithText width={160} height={40} />
          </Link>
        )}
        <IconButton onClick={toggleCollapsed} sx={{ ml: collapsed ? 0 : 'auto' }}>
          {collapsed ? <ChevronRightIcon size={20} /> : <ChevronLeftIcon size={20} />}
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isItemActive = isActive(item.href);
          const isExpanded = expandedItems[item.name];

          return (
            <React.Fragment key={item.name}>
              <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                {hasSubItems ? (
                  <ListItemButton
                    onClick={() => toggleSubMenu(item.name)}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed ? 'center' : 'initial',
                      px: 2.5,
                      borderRadius: '8px',
                      backgroundColor: isItemActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: collapsed ? 0 : 2,
                        justifyContent: 'center',
                        color: isItemActive ? 'primary.main' : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText
                          primary={item.name}
                          sx={{
                            opacity: collapsed ? 0 : 1,
                            color: isItemActive ? 'primary.main' : 'inherit',
                          }}
                        />
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </>
                    )}
                  </ListItemButton>
                ) : (
                  <ListItemButton
                    component={Link}
                    to={item.href}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed ? 'center' : 'initial',
                      px: 2.5,
                      borderRadius: '8px',
                      backgroundColor: isItemActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: collapsed ? 0 : 2,
                        justifyContent: 'center',
                        color: isItemActive ? 'primary.main' : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.name}
                        sx={{
                          opacity: collapsed ? 0 : 1,
                          color: isItemActive ? 'primary.main' : 'inherit',
                        }}
                      />
                    )}
                  </ListItemButton>
                )}
              </ListItem>
              {hasSubItems && !collapsed && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems?.map((subItem) => (
                      <ListItemButton
                        key={subItem.href}
                        component={Link}
                        to={subItem.href}
                        sx={{
                          pl: 4,
                          py: 0.75,
                          minHeight: 40,
                          borderRadius: '8px',
                          ml: 2,
                          backgroundColor: isActive(subItem.href)
                            ? 'rgba(25, 118, 210, 0.08)'
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          },
                        }}
                      >
                        <ListItemText
                          primary={subItem.name}
                          primaryTypographyProps={{ fontSize: 14 }}
                          sx={{
                            color: isActive(subItem.href) ? 'primary.main' : 'inherit',
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box
        sx={{
          p: collapsed ? 1 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <Avatar
          sx={{ width: 32, height: 32, mr: collapsed ? 0 : 2 }}
          alt={user?.name || '사용자'}
          src="/placeholder.svg"
        >
          {user?.name ? user.name.charAt(0) : 'U'}
        </Avatar>
        {!collapsed && (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {user?.name || '사용자'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || ''}
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* 앱바 */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          ml: { sm: `${collapsed ? collapsedDrawerWidth : drawerWidth}px` },
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ mr: 2, color: 'white' }}>
            <NotificationBadge className="text-white" />
          </Box>

          {/* 사용자 메뉴 */}
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
            sx={{ p: 0 }}
          >
            <Avatar
              sx={{ width: 32, height: 32 }}
              alt={user?.name || '사용자'}
              src="/placeholder.svg"
            >
              {user?.name ? user.name.charAt(0) : 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
          >
            <MuiMenuItem component={Link} to="/profile" onClick={handleUserMenuClose}>
              내 프로필
            </MuiMenuItem>
            <MuiMenuItem onClick={handleSignOut}>로그아웃</MuiMenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* 모바일 드로어 */}
      <Box
        component="nav"
        sx={{
          width: { sm: collapsed ? collapsedDrawerWidth : drawerWidth },
          flexShrink: { sm: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // 모바일 성능 향상을 위해
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {renderDrawerContent()}
        </Drawer>

        {/* 데스크톱 드로어 */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: collapsed ? collapsedDrawerWidth : drawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
          open
        >
          {renderDrawerContent()}
        </Drawer>
      </Box>

      {/* 메인 콘텐츠 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar /> {/* 앱바 높이만큼 여백 */}
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
