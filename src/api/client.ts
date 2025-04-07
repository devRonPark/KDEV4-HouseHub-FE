import axios from 'axios';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // 쿠키를 요청에 포함시키기 위한 설정
  withCredentials: true,
  timeout: 10000, // 10초
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 세션 기반 인증은 쿠키가 자동으로 포함되므로
    // 별도의 헤더 설정이 필요 없음
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
