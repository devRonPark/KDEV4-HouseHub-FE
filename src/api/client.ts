import axios from 'axios';

// 인증이 필요하지 않은 경로 목록
const publicPaths = [
  '/api/inquiries/share', // 공유 템플릿 조회 API
  '/api/inquiries', // 문의 등록 API
];

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
    // 공개 API 경로 체크
    const isPublicPath = publicPaths.some((path) => config.url?.startsWith(path));

    // 공개 경로인 경우 withCredentials 설정을 false로 변경
    if (isPublicPath) {
      config.withCredentials = false;
    }

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
    // 에러 처리
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error('API Error:', error.response.data);

      // 공개 경로에서는 401 에러를 무시
      const isPublicPath = publicPaths.some((path) => error.config?.url?.startsWith(path));

      // 401 Unauthorized 에러 처리 (세션 만료 등)
      if (error.response.status === 401 && !isPublicPath) {
        // 로그인 페이지로 리다이렉트 (필요시 구현)
        // window.location.href = '/signin';
      }
    } else if (error.request) {
      // 요청이 전송되었으나 응답을 받지 못한 경우
      console.error('No response received:', error.request);
    } else {
      // 요청 설정 중 오류가 발생한 경우
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
