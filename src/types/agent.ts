// 공인중개사(에이전트) 정보 타입
export interface Agent {
  id: string;
  name: string;
  email: string;
  contact: string;
  licenseNumber?: string;
  role: 'ADMIN' | 'AGENT';
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

// 공인중개사 상세 정보 (본인 정보 조회 시 반환되는 데이터)
export interface AgentDetail extends Agent {
  realEstate?: {
    id: string;
    name: string;
    businessRegistrationNumber?: string;
    address?: string;
    roadAddress?: string;
    contact?: string;
  };
}
