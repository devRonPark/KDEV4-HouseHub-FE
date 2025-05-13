import apiClient from './client';
import type {
  ConsultationReqDto,
  UpdateConsultationReqDto,
  ConsultationResDto,
} from '../types/consultation';

// 상담 상세 조회
export const getConsultationById = async (id: number) => {
  try {
    const response = await apiClient.get(`/consultations/${id}`);
    return {
      success: true,
      data: response.data.data as ConsultationResDto,
    };
  } catch {
    return {
      success: false,
      error: '상담 정보를 불러오는데 실패했습니다.',
    };
  }
};

// 상담 등록
export const createConsultation = async (data: ConsultationReqDto) => {
  try {
    const response = await apiClient.post('/consultations', data);
    return {
      success: true,
      data: response.data as ConsultationResDto,
    };
  } catch {
    return {
      success: false,
      error: '상담 등록에 실패했습니다.',
    };
  }
};

// 상담 수정
export const updateConsultation = async (id: number, data: Partial<UpdateConsultationReqDto>) => {
  try {
    // agentId가 포함되어 있는지 확인
    if (!data.agentId) {
      return {
        success: false,
        error: '공인중개사 ID(agentId)는 필수 항목입니다.',
      };
    }

    const response = await apiClient.patch(`/consultations/${id}`, data);

    return {
      success: true,
      data: response.data as ConsultationResDto,
    };
  } catch {
    return {
      success: false,
      error: '상담 정보 수정에 실패했습니다.',
    };
  }
};

// 상담 삭제
export const deleteConsultation = async (id: number) => {
  try {
    await apiClient.delete(`/consultations/${id}`);
    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: '상담 삭제에 실패했습니다.',
    };
  }
};

// 상담 목록 조회
export const getConsultationList = async (params: {
  page?: number;
  size?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}) => {
  try {
    const response = await apiClient.get('/consultations', {
      params: {
        ...params,
        page: params.page ? params.page - 1 : 0, // 백엔드는 0부터 시작하는 페이지 인덱스 사용
      },
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch {
    return {
      success: false,
      error: '상담 목록을 불러오는데 실패했습니다.',
    };
  }
};
