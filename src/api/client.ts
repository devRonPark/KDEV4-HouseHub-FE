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
    // 에러 처리
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error('API Error:', error.response.data);

      // 401 Unauthorized 에러 처리 (토큰 만료 등)
      if (error.response.status === 401) {
        // 로그인 페이지로 리다이렉트
        window.location.href = '/signin';
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
