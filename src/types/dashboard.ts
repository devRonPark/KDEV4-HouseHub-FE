import { PropertyType } from './property';

// 대시보드 주요 지표 타입
export interface DashboardStats {
  totalProperties: number;
  activeContracts: number;
  newCustomers: number;
  completedContracts: number;
}

// 최근 활동 내역 타입
export interface Activity {
  id: string;
  type: 'customer' | 'property' | 'consultation' | 'inquiry';
  title: string;
  description: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  relatedTo?: {
    id: string;
    type: string;
    name: string;
  };
}

// 알림 타입
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// 차트 데이터 타입
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface RecentProperty {
  id: string;
  propertyType: PropertyType;
  location: string;
  createdAt: string;
}
