'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/useToast';
import { getInquiryById } from '../../api/inquiry';
import type { InquiryDetail } from '../../types/inquiry';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const InquiryDetail: React.FC = () => {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInquiryDetail = async () => {
      if (!inquiryId) return;

      setIsLoading(true);
      try {
        const response = await getInquiryById(Number(inquiryId));
        if (response.success && response.data) {
          setInquiry(response.data);
        } else {
          showToast(response.error || '문의 상세 정보를 불러오는데 실패했습니다.', 'error');
          navigate('/inquiries');
        }
      } catch (error) {
        console.error('문의 상세 정보를 불러오는 중 오류가 발생했습니다:', error);
        showToast('문의 상세 정보를 불러오는 중 오류가 발생했습니다.', 'error');
        navigate('/inquiries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiryDetail();
  }, [inquiryId, navigate, showToast]);

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
    } catch {
      return dateString;
    }
  };

  // 뒤로 가기 핸들러
  const handleGoBack = () => {
    navigate('/inquiries');
  };

  return (
    <DashboardLayout>
      <div className="pb-5 mb-6 border-b border-gray-200">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">문의 상세 정보</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : inquiry ? (
        <div className="space-y-6">
          {/* 고객 정보 섹션 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">고객 정보</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                문의를 제출한 고객의 상세 정보입니다.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-5 w-5 mr-2 text-gray-400" />
                    고객명
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {inquiry.customerName}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-gray-400" />
                    이메일
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {inquiry.customerEmail}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-gray-400" />
                    연락처
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {inquiry.customerContact}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                    문의일시
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(inquiry.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* 문의 내용 섹션 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">문의 내용</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">고객이 제출한 문의 내용입니다.</p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  {inquiry.answers.map((answer, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">{answer.questionContent}</h4>
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {answer.answer || <span className="text-gray-400">응답 없음</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 답변 작성 섹션 (향후 구현) */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">답변 작성</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                고객 문의에 대한 답변을 작성할 수 있습니다.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500 italic">답변 작성 기능은 준비 중입니다.</p>
              </div>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleGoBack}>
              목록으로 돌아가기
            </Button>
            <Button variant="primary" disabled>
              답변 저장
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">문의 정보를 찾을 수 없습니다.</p>
          <Button variant="outline" onClick={handleGoBack} className="mt-4">
            목록으로 돌아가기
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InquiryDetail;
