'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Tabs, Tab, CircularProgress } from '@mui/material';
import {
  MessageSquare,
  FileText,
  DollarSign,
  HelpCircle,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  getCustomerConsultations,
  getCustomerBuyContracts,
  getCustomerSellContracts,
  getCustomerInquiries,
} from '../../api/customer';
import type { ApiResponse } from '../../types/api';
import type { ConsultationListResDto } from '../../types/consultation';
import type { CustomerResDto } from '../../types/customer';
import { ContractStatus, ContractType, type ContractListResDto } from '../../types/contract';
import { CustomerType, type InquiryListResponse } from '../../types/inquiry';
import { PaginationDto } from '../../types/pagination';
import { useNavigate } from 'react-router-dom';

interface CustomerHistoryProps {
  customer: CustomerResDto | null;
  className?: string;
}

const CustomerHistory = ({ customer, className = '' }: CustomerHistoryProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [consultations, setConsultations] = useState<ConsultationListResDto | null>(null);
  const [buyContracts, setBuyContracts] = useState<ContractListResDto | null>(null);
  const [sellContracts, setSellContracts] = useState<ContractListResDto | null>(null);
  const [inquiries, setInquiries] = useState<InquiryListResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // 탭 변경 핸들러
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1); // 탭 변경 시 페이지 초기화
  };

  // 고객이 선택되면 데이터 로드
  useEffect(() => {
    if (!customer) {
      // 고객이 선택되지 않은 경우 데이터 초기화
      setConsultations(null);
      setBuyContracts(null);
      setSellContracts(null);
      setInquiries(null);
      return;
    }

    const loadCustomerHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        // 현재 활성화된 탭에 따라 데이터 로드
        switch (activeTab) {
          case 0: {
            // 상담 내역
            const response: ApiResponse<ConsultationListResDto> = await getCustomerConsultations(
              customer.id,
              page - 1, // API는 0-based 페이지 인덱스 사용
              pageSize
            );
            if (response.success) {
              setConsultations(response?.data ?? null);
            } else {
              setError(response.error || '상담 내역을 불러오는데 실패했습니다.');
            }
            break;
          }

          case 1: {
            // 매수 계약 내역
            const response: ApiResponse<ContractListResDto> = await getCustomerBuyContracts(
              customer.id,
              page,
              pageSize
            );
            if (response.success) {
              setBuyContracts(response?.data ?? null);
            } else {
              setError(response.error || '매수 계약 내역을 불러오는데 실패했습니다.');
            }
            break;
          }

          case 2: {
            // 매도 계약 내역
            const response: ApiResponse<ContractListResDto> = await getCustomerSellContracts(
              customer.id,
              page,
              pageSize
            );
            if (response.success) {
              setSellContracts(response?.data ?? null);
            } else {
              setError(response.error || '매도 계약 내역을 불러오는데 실패했습니다.');
            }
            break;
          }

          case 3: {
            // 문의 내역
            const response: ApiResponse<InquiryListResponse> = await getCustomerInquiries(
              customer.id,
              page,
              pageSize
            );
            if (response.success) {
              setInquiries(response?.data ?? null);
            } else {
              setError(response.error || '문의 내역을 불러오는데 실패했습니다.');
            }
            break;
          }
        }
      } catch (err) {
        console.error('고객 이력 조회 중 오류 발생:', err);
        setError('고객 이력을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadCustomerHistory();
  }, [customer, activeTab, page]);

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // 데이터 없음 표시 컴포넌트
  const NoDataDisplay = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
      <AlertCircle size={32} className="mb-2 text-gray-400" />
      <p>{message}</p>
    </div>
  );

  // 로딩 표시 컴포넌트
  const LoadingDisplay = () => (
    <div className="flex justify-center items-center py-8">
      <CircularProgress size={32} />
    </div>
  );

  // 에러 표시 컴포넌트
  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="bg-red-50 text-red-700 p-4 rounded-md">
      <p>{message}</p>
    </div>
  );

  // 페이지네이션 컴포넌트
  const Pagination = <T,>({ data }: { data: { content: T[]; pagination: PaginationDto } }) => {
    if (!data || !data.pagination || data.pagination.totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-4">
        <nav className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`px-2 py-1 rounded ${
              page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            이전
          </button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded ${pageNum === page ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                {pageNum}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === data.pagination.totalPages}
            className={`px-2 py-1 rounded ${
              page === data.pagination.totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            다음
          </button>
        </nav>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {/* 고객 정보 헤더 */}
      <div className="p-4 border-b border-gray-200">
        {customer ? (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{customer.name}</h3>
              <p className="text-sm text-gray-500">{customer.contact}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-gray-500">
            <p>고객을 선택하면 이력이 표시됩니다</p>
          </div>
        )}
      </div>

      {/* 탭 메뉴 */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        className="border-b border-gray-200"
      >
        <Tab
          icon={<MessageSquare size={16} />}
          label="상담"
          iconPosition="start"
          disabled={!customer}
        />
        <Tab
          icon={<DollarSign size={16} />}
          label="매수"
          iconPosition="start"
          disabled={!customer}
        />
        <Tab icon={<FileText size={16} />} label="매도" iconPosition="start" disabled={!customer} />
        <Tab
          icon={<HelpCircle size={16} />}
          label="문의"
          iconPosition="start"
          disabled={!customer}
        />
      </Tabs>

      {/* 탭 내용 */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {!customer ? (
          <NoDataDisplay message="고객을 선택하면 이력이 표시됩니다" />
        ) : loading ? (
          <LoadingDisplay />
        ) : error ? (
          <ErrorDisplay message={error} />
        ) : (
          <>
            {/* 상담 내역 탭 */}
            {activeTab === 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">상담 내역</h3>
                {!consultations || consultations.content.length === 0 ? (
                  <NoDataDisplay message="상담 내역이 없습니다" />
                ) : (
                  <>
                    <div className="space-y-3">
                      {consultations.content.map((consultation) => (
                        <div
                          key={consultation.id}
                          className="border border-gray-200 rounded-md p-3 bg-white"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <Calendar size={16} className="text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">
                                {formatDate(consultation.consultationDate)}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                consultation.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800'
                                  : consultation.status === 'CANCELED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {consultation.status === 'COMPLETED'
                                ? '완료'
                                : consultation.status === 'CANCELED'
                                  ? '취소됨'
                                  : '예약됨'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-700">{consultation.content}</p>
                        </div>
                      ))}
                    </div>
                    <Pagination data={consultations} />
                  </>
                )}
              </div>
            )}

            {/* 매수 계약 내역 탭 */}
            {activeTab === 1 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">매수 계약 내역</h3>
                {!buyContracts || buyContracts.content.length === 0 ? (
                  <NoDataDisplay message="매수 계약 내역이 없습니다" />
                ) : (
                  <>
                    <div className="space-y-3">
                      {buyContracts.content.map((contract) => (
                        <div
                          key={contract.id}
                          className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => navigate(`/contracts/${contract.id}`)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {contract.contractType === ContractType.SALE
                                  ? '매매'
                                  : contract.contractType === ContractType.JEONSE
                                    ? '전세'
                                    : '월세'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {contract.startedAt
                                  ? new Date(contract.startedAt).toLocaleDateString('ko-KR')
                                  : '날짜 정보 없음'}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                contract.status === ContractStatus.COMPLETED
                                  ? 'bg-green-100 text-green-800'
                                  : contract.status === ContractStatus.IN_PROGRESS
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {contract.status === ContractStatus.COMPLETED
                                ? '완료'
                                : contract.status === ContractStatus.IN_PROGRESS
                                  ? '진행중'
                                  : '취소'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Pagination data={buyContracts} />
                  </>
                )}
              </div>
            )}

            {/* 매도 계약 내역 탭 */}
            {activeTab === 2 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">매도 계약 내역</h3>
                {!sellContracts || sellContracts.content.length === 0 ? (
                  <NoDataDisplay message="매도 계약 내역이 없습니다" />
                ) : (
                  <>
                    <div className="space-y-3">
                      {sellContracts.content.map((contract) => (
                        <div
                          key={contract.id}
                          className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => navigate(`/contracts/${contract.id}`)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {contract.contractType === ContractType.SALE
                                  ? '매매'
                                  : contract.contractType === ContractType.JEONSE
                                    ? '전세'
                                    : '월세'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {contract.startedAt
                                  ? new Date(contract.startedAt).toLocaleDateString('ko-KR')
                                  : '날짜 정보 없음'}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                contract.status === ContractStatus.COMPLETED
                                  ? 'bg-green-100 text-green-800'
                                  : contract.status === ContractStatus.IN_PROGRESS
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {contract.status === ContractStatus.COMPLETED
                                ? '완료'
                                : contract.status === ContractStatus.IN_PROGRESS
                                  ? '진행중'
                                  : '취소'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Pagination data={sellContracts} />
                  </>
                )}
              </div>
            )}

            {/* 문의 내역 탭 */}
            {activeTab === 3 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">문의 내역</h3>
                {!inquiries || inquiries.content.length === 0 ? (
                  <NoDataDisplay message="문의 내역이 없습니다" />
                ) : (
                  <>
                    <div className="space-y-3">
                      {inquiries.content.map((inquiry) => (
                        <div
                          key={inquiry.inquiryId}
                          className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => navigate(`/inquiries/${inquiry.inquiryId}/answers`)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {inquiry.name || '제목 없음'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                inquiry.customerType === CustomerType.CUSTOMER
                                  ? 'bg-green-100 text-green-800'
                                  : inquiry.customerType === CustomerType.CUSTOMER_CANDIDATE
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {inquiry.customerType === CustomerType.CUSTOMER
                                ? '고객'
                                : inquiry.customerType === CustomerType.CUSTOMER_CANDIDATE
                                  ? '예비고객'
                                  : '기타'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Pagination data={inquiries} />
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerHistory;
