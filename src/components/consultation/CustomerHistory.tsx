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
  getCustomerPurchaseContracts,
  getCustomerSaleContracts,
  getCustomerInquiries,
} from '../../api/customer';
import { CustomerResDto } from '../../types/consultation';

// 페이지네이션 타입 정의 추가
interface Pagination {
  totalPages: number;
  totalElements: number;
  size: number;
  currentPage: number;
}

// 페이지네이션된 데이터 타입 정의
interface PaginatedData<T> {
  content: T[];
  pagination: Pagination;
}

interface CustomerHistoryProps {
  customer: CustomerResDto | null;
  className?: string;
}

const CustomerHistory = ({ customer, className = '' }: CustomerHistoryProps) => {
  const [activeTab, setActiveTab] = useState(0);
  // 상태 타입 변경
  const [consultations, setConsultations] = useState<PaginatedData<any>>({
    content: [],
    pagination: { totalPages: 0, totalElements: 0, size: 10, currentPage: 0 },
  });
  const [purchaseContracts, setPurchaseContracts] = useState<PaginatedData<any>>({
    content: [],
    pagination: { totalPages: 0, totalElements: 0, size: 10, currentPage: 0 },
  });
  const [saleContracts, setSaleContracts] = useState<PaginatedData<any>>({
    content: [],
    pagination: { totalPages: 0, totalElements: 0, size: 10, currentPage: 0 },
  });
  const [inquiries, setInquiries] = useState<PaginatedData<any>>({
    content: [],
    pagination: { totalPages: 0, totalElements: 0, size: 10, currentPage: 0 },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 탭 변경 핸들러
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 고객이 선택되면 데이터 로드
  useEffect(() => {
    if (!customer) {
      // 고객이 선택되지 않은 경우 데이터 초기화
      setConsultations({
        content: [],
        pagination: { totalPages: 0, totalElements: 0, size: 10, currentPage: 0 },
      });
      setPurchaseContracts({
        content: [],
        pagination: { totalPages: 0, totalElements: 0, size: 10, currentPage: 0 },
      });
      setSaleContracts({
        content: [],
        pagination: { totalPages: 0, totalElements: 0, size: 10, currentPage: 0 },
      });
      setInquiries({
        content: [],
        pagination: { totalPages: 0, totalElements: 0, size: 10, currentPage: 0 },
      });
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
            const consultationResponse = await getCustomerConsultations(customer.id);
            console.log('상담 내역 응답:', consultationResponse);
            if (consultationResponse.success) {
              setConsultations(
                consultationResponse.data || {
                  content: [],
                  pagination: { totalPages: 0, totalElements: 0, size: 10, currentPage: 0 },
                }
              );
            } else {
              setError('상담 내역을 불러오는데 실패했습니다.');
            }
            break;
          }

          case 1: {
            // 매수 계약 내역
            const purchaseResponse = await getCustomerPurchaseContracts(customer.id);
            if (purchaseResponse.success) {
              setPurchaseContracts(
                purchaseResponse.data || {
                  content: [],
                  pagination: { totalPages: 0, totalElements: 0, size: 10, currentPage: 0 },
                }
              );
            } else {
              setError('매수 계약 내역을 불러오는데 실패했습니다.');
            }
            break;
          }

          case 2: {
            // 매도 계약 내역
            const saleResponse = await getCustomerSaleContracts(customer.id);
            if (saleResponse.success) {
              setSaleContracts(
                saleResponse.data || {
                  content: [],
                  pagination: { totalPages: 0, totalElements: 0, size: 10, currentPage: 0 },
                }
              );
            } else {
              setError('매도 계약 내역을 불러오는데 실패했습니다.');
            }
            break;
          }

          case 3: {
            // 문의 내역
            const inquiryResponse = await getCustomerInquiries(customer.id);
            if (inquiryResponse.success) {
              setInquiries(
                inquiryResponse.data || {
                  content: [],
                  pagination: { totalPages: 0, totalElements: 0, size: 10, currentPage: 0 },
                }
              );
            } else {
              setError('문의 내역을 불러오는데 실패했습니다.');
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
  }, [customer, activeTab]);

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatDateWithTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
                {consultations.content.length === 0 ? (
                  <NoDataDisplay message="상담 내역이 없습니다" />
                ) : (
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
                              {formatDateWithTime(consultation.consultationDate)}
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
                )}
              </div>
            )}

            {/* 매수 계약 내역 탭 */}
            {activeTab === 1 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">매수 계약 내역</h3>
                {purchaseContracts.content.length === 0 ? (
                  <NoDataDisplay message="매수 계약 내역이 없습니다" />
                ) : (
                  <div className="space-y-3">
                    {purchaseContracts.content.map((contract) => (
                      <div
                        key={contract.id}
                        className="border border-gray-200 rounded-md p-3 bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Calendar size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {formatDate(contract.contractDate)}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              contract.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : contract.status === 'CANCELED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {contract.status === 'COMPLETED'
                              ? '완료'
                              : contract.status === 'CANCELED'
                                ? '취소됨'
                                : '진행중'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-700">
                          {contract.propertyName || '매물명 없음'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {contract.propertyAddress || '주소 정보 없음'}
                        </p>
                        <p className="mt-1 text-sm font-bold text-blue-600">
                          {contract.amount?.toLocaleString() || '0'}원
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 매도 계약 내역 탭 */}
            {activeTab === 2 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">매도 계약 내역</h3>
                {saleContracts.content.length === 0 ? (
                  <NoDataDisplay message="매도 계약 내역이 없습니다" />
                ) : (
                  <div className="space-y-3">
                    {saleContracts.content.map((contract) => (
                      <div
                        key={contract.id}
                        className="border border-gray-200 rounded-md p-3 bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Calendar size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {formatDate(contract.contractDate)}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              contract.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : contract.status === 'CANCELED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {contract.status === 'COMPLETED'
                              ? '완료'
                              : contract.status === 'CANCELED'
                                ? '취소됨'
                                : '진행중'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-700">
                          {contract.propertyName || '매물명 없음'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {contract.propertyAddress || '주소 정보 없음'}
                        </p>
                        <p className="mt-1 text-sm font-bold text-blue-600">
                          {contract.amount?.toLocaleString() || '0'}원
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 문의 내역 탭 */}
            {activeTab === 3 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">문의 내역</h3>
                {inquiries.content.length === 0 ? (
                  <NoDataDisplay message="문의 내역이 없습니다" />
                ) : (
                  <div className="space-y-3">
                    {inquiries.content.map((inquiry) => (
                      <div
                        key={inquiry.id}
                        className="border border-gray-200 rounded-md p-3 bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Calendar size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {formatDate(inquiry.createdAt)}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              inquiry.status === 'ANSWERED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {inquiry.status === 'ANSWERED' ? '답변완료' : '대기중'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-700">
                          {inquiry.title || '제목 없음'}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">{inquiry.content}</p>
                      </div>
                    ))}
                  </div>
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
