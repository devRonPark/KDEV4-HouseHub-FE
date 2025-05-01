'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Clock,
  File,
  MessageSquare,
  Tag,
} from 'react-feather';
import {
  getCustomerById,
  updateMyCustomer,
  getCustomerConsultations,
  getCustomerSellContracts,
  getCustomerBuyContracts,
  getCustomerInquiries,
} from '../../api/customer';
import { useToast } from '../../context/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import CustomerForm from '../../components/customers/CustomerForm';
import { formatPhoneNumber } from '../../utils/format';
import type { Customer, CreateCustomerReqDto } from '../../types/customer';
import type { ConsultationListResDto } from '../../types/consultation';
import type { ContractListResDto } from '../../types/contract';
import type { InquiryListResponse } from '../../types/inquiry';
import { ContractType, ContractStatus } from '../../types/contract';
import { CustomerType } from '../../types/inquiry';

type TabType = 'consultation' | 'contract' | 'inquiry';
type ContractTabType = 'sale' | 'purchase';

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('consultation');
  const [activeContractTab, setActiveContractTab] = useState<ContractTabType>('sale');

  // 각 탭별 상태 관리
  const [consultations, setConsultations] = useState<ConsultationListResDto | null>(null);
  const [contracts, setContracts] = useState<ContractListResDto | null>(null);
  const [inquiries, setInquiries] = useState<InquiryListResponse | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [saleCurrentPage, setSaleCurrentPage] = useState(1);
  const [purchaseCurrentPage, setPurchaseCurrentPage] = useState(1);

  // 페이지 변경 핸들러 추가
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSalePageChange = (page: number) => {
    setSaleCurrentPage(page);
  };

  const handlePurchasePageChange = (page: number) => {
    setPurchaseCurrentPage(page);
  };

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;

      try {
        const response = await getCustomerById(Number(id));
        if (response.success && response.data) {
          if (response.data.deletedAt) {
            showToast('삭제된 고객의 상세 정보는 볼 수 없습니다.', 'error');
            navigate('/customers');
            return;
          }
          setCustomer(response.data);
        } else {
          showToast(response.error || '고객 정보를 불러오는데 실패했습니다.', 'error');
          navigate('/customers');
        }
      } catch (error) {
        console.error('고객 정보를 불러오는 중 오류가 발생했습니다:', error);
        showToast('고객 정보를 불러오는 중 오류가 발생했습니다.', 'error');
        navigate('/customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, navigate, showToast]);

  // 탭별 데이터 조회
  useEffect(() => {
    const fetchTabData = async () => {
      if (!id || !customer) return;

      try {
        let response;
        switch (activeTab) {
          case 'consultation':
            response = await getCustomerConsultations(Number(id), currentPage, pageSize);
            if (response.success && response.data) {
              setConsultations(response.data);
            }
            break;
          case 'contract':
            if (activeContractTab === 'sale') {
              response = await getCustomerSellContracts(Number(id), saleCurrentPage, pageSize);
              if (response.success && response.data) {
                setContracts(response.data);
              }
            } else {
              response = await getCustomerBuyContracts(Number(id), purchaseCurrentPage, pageSize);
              if (response.success && response.data) {
                setContracts(response.data);
              }
            }
            break;
          case 'inquiry':
            response = await getCustomerInquiries(Number(id), currentPage, pageSize);
            if (response.success && response.data) {
              setInquiries(response.data);
            }
            break;
        }
      } catch (error) {
        console.error(`${activeTab} 목록을 불러오는 중 오류가 발생했습니다:`, error);
        showToast(`${activeTab} 목록을 불러오는 중 오류가 발생했습니다.`, 'error');
      }
    };

    fetchTabData();
  }, [
    id,
    customer,
    activeTab,
    activeContractTab,
    currentPage,
    saleCurrentPage,
    purchaseCurrentPage,
    pageSize,
    showToast,
  ]);

  const handleUpdateCustomer = async (data: Partial<Customer>) => {
    if (!customer) return;

    try {
      const requestData: CreateCustomerReqDto = {
        name: data.name === '' ? undefined : data.name || customer.name,
        email: data.email === '' ? undefined : data.email || customer.email,
        contact: data.contact || customer.contact,
        birthDate: data.birthDate === '' ? undefined : data.birthDate || customer.birthDate,
        gender: data.gender === undefined ? undefined : data.gender || customer.gender,
        memo: data.memo === '' ? undefined : data.memo || customer.memo,
        tagIds: data.tagIds || [],
      };

      const response = await updateMyCustomer(customer.id, requestData);
      if (response.success && response.data) {
        showToast('고객 정보가 성공적으로 수정되었습니다.', 'success');
        // 수정된 정보로 고객 정보 업데이트
        const updatedResponse = await getCustomerById(customer.id);
        if (updatedResponse.success && updatedResponse.data) {
          setCustomer(updatedResponse.data);
        }
        setIsEditing(false);
      } else {
        if (response.errors && response.errors.length > 0) {
          // 각 에러 메시지를 토스트로 표시
          response.errors.forEach((error) => {
            showToast(error.message, 'error');
          });
        } else {
          showToast(response.message || '고객 정보 수정에 실패했습니다.', 'error');
        }
      }
    } catch (error) {
      console.error('고객 정보 수정 중 오류가 발생했습니다:', error);
      showToast('고객 정보 수정 중 오류가 발생했습니다.', 'error');
    }
  };

  const getConsultationStatusText = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return '예약';
      case 'COMPLETED':
        return '완료';
      case 'CANCELED':
        return '취소';
      default:
        return status;
    }
  };

  const getConsultationStatusClass = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) return null;

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 text-left">고객 상세 정보</h1>
        <div className="mt-3 sm:mt-0 sm:flex sm:space-x-3">
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit size={16} />}
            >
              수정
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/customers')}
            leftIcon={<ArrowLeft size={16} />}
          >
            목록으로 돌아가기
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {isEditing ? (
          <Card>
            <CustomerForm
              initialData={customer}
              onSubmit={handleUpdateCustomer}
              onCancel={() => setIsEditing(false)}
            />
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">이름</p>
                        <p className="text-gray-900">{customer.name || '미등록'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Phone size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">연락처</p>
                        <p className="text-gray-900">{formatPhoneNumber(customer.contact)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Mail size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">이메일</p>
                        <p className="text-gray-900">{customer.email || '미등록'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Calendar size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">생년월일 / 성별</p>
                        <p className="text-gray-900">
                          {customer.birthDate || '미등록'} /{' '}
                          {customer.gender === 'M'
                            ? '남성'
                            : customer.gender === 'F'
                              ? '여성'
                              : '미등록'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <FileText size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">메모</p>
                        <p className="text-gray-900 whitespace-pre-line">
                          {customer.memo || '미등록'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 태그 정보 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">태그</h3>
                  {customer.tags && customer.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {customer.tags.map((tag) => (
                        <span
                          key={tag.tagId}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          <Tag size={12} className="mr-1" />
                          {tag.type}: {tag.value}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">등록된 태그가 없습니다.</p>
                  )}
                </div>
              </div>
            </Card>

            {/* 탭 메뉴 */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('consultation')}
                  className={`${
                    activeTab === 'consultation'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <MessageSquare size={16} />
                  <span>상담 내역</span>
                </button>
                <button
                  onClick={() => setActiveTab('contract')}
                  className={`${
                    activeTab === 'contract'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <File size={16} />
                  <span>계약 내역</span>
                </button>
                <button
                  onClick={() => setActiveTab('inquiry')}
                  className={`${
                    activeTab === 'inquiry'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <MessageSquare size={16} />
                  <span>문의 내역</span>
                </button>
              </nav>
            </div>

            {/* 탭 컨텐츠 */}
            <Card>
              {activeTab === 'consultation' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">상담 내역</h2>
                  {consultations?.content && consultations.content.length > 0 ? (
                    <div className="space-y-4">
                      {consultations.content.map((consultation) => (
                        <div
                          key={consultation.id}
                          className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => navigate(`/consultations/${consultation.id}`)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Clock size={20} className="text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {consultation.consultationType === 'VISIT'
                                    ? '방문 상담'
                                    : '전화 상담'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {consultation.consultationDate
                                    ? new Date(consultation.consultationDate).toLocaleString(
                                        'ko-KR',
                                        {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: true,
                                        }
                                      )
                                    : '날짜 정보 없음'}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getConsultationStatusClass(
                                consultation.status
                              )}`}
                            >
                              {getConsultationStatusText(consultation.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">상담 내역 없음</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        아직 기록된 상담 내역이 없습니다.
                      </p>
                    </div>
                  )}

                  {/* 페이지네이션 컴포넌트 추가 */}
                  {consultations && (
                    <div className="mt-4 flex justify-center">
                      <div className="flex space-x-2">
                        {Array.from(
                          { length: Math.ceil(consultations.pagination.totalElements / pageSize) },
                          (_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => handlePageChange(i + 1)}
                              className={`px-3 py-1 rounded ${
                                currentPage === i + 1
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {i + 1}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'contract' && (
                <div>
                  <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setActiveContractTab('sale')}
                        className={`${
                          activeContractTab === 'sale'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        매도 계약 내역
                      </button>
                      <button
                        onClick={() => setActiveContractTab('purchase')}
                        className={`${
                          activeContractTab === 'purchase'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        매수 계약 내역
                      </button>
                    </nav>
                  </div>

                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    {activeContractTab === 'sale' ? '매도 계약 내역' : '매수 계약 내역'}
                  </h2>
                  {contracts?.content && contracts.content.length > 0 ? (
                    <div className="space-y-4">
                      {contracts.content.map((contract) => (
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
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <File className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {activeContractTab === 'sale'
                          ? '매도 계약 내역 없음'
                          : '매수 계약 내역 없음'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {activeContractTab === 'sale'
                          ? '아직 기록된 매도 계약 내역이 없습니다.'
                          : '아직 기록된 매수 계약 내역이 없습니다.'}
                      </p>
                    </div>
                  )}

                  {/* 페이지네이션 컴포넌트 추가 */}
                  {contracts && (
                    <div className="mt-4 flex justify-center">
                      <div className="flex space-x-2">
                        {Array.from(
                          { length: Math.ceil(contracts.pagination.totalElements / pageSize) },
                          (_, i) => (
                            <button
                              key={i + 1}
                              onClick={() =>
                                activeContractTab === 'sale'
                                  ? handleSalePageChange(i + 1)
                                  : handlePurchasePageChange(i + 1)
                              }
                              className={`px-3 py-1 rounded ${
                                (activeContractTab === 'sale'
                                  ? saleCurrentPage
                                  : purchaseCurrentPage) ===
                                i + 1
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {i + 1}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'inquiry' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">문의 내역</h2>
                  {inquiries?.content && inquiries.content.length > 0 ? (
                    <div className="space-y-4">
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
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">문의 내역 없음</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        아직 기록된 문의 내역이 없습니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDetailPage;
