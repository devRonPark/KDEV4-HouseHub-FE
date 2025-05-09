'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Home,
} from 'react-feather';
import {
  getCustomerById,
  updateMyCustomer,
  getCustomerConsultations,
  getCustomerSellContracts,
  getCustomerBuyContracts,
  getCustomerInquiries,
  getCustomerSms,
  getCustomerRecommendProperties,
  getCustomerRecommendCrawlProperties,
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
import type { SmsListResDto, SendSmsResDto } from '../../types/sms';
import SmsDetailModal from '../../components/sms/SmsDetailModal';
import type { FindPropertyResDto, CrawlingPropertyResDto } from '../../types/property';
import { PropertyTypeLabels, PropertyDirectionLabels } from '../../types/property';

type TabType = 'consultation' | 'contract' | 'inquiry' | 'sms' | 'recommend';
type ContractTabType = 'sale' | 'purchase';
type RecommendTabType = 'my' | 'public';

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('consultation');
  const [activeContractTab, setActiveContractTab] = useState<ContractTabType>('sale');
  const [activeRecommendTab, setActiveRecommendTab] = useState<RecommendTabType>('my');

  // 각 탭별 상태 관리
  const [consultations, setConsultations] = useState<ConsultationListResDto | null>(null);
  const [contracts, setContracts] = useState<ContractListResDto | null>(null);
  const [inquiries, setInquiries] = useState<InquiryListResponse | null>(null);
  const [smsList, setSmsList] = useState<SmsListResDto | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [saleCurrentPage, setSaleCurrentPage] = useState(1);
  const [purchaseCurrentPage, setPurchaseCurrentPage] = useState(1);
  const [smsCurrentPage, setSmsCurrentPage] = useState(1);

  const [selectedSms, setSelectedSms] = useState<SendSmsResDto | null>(null);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);

  const [recommendProperties, setRecommendProperties] = useState<FindPropertyResDto[]>([]);
  const [isLoadingRecommend, setIsLoadingRecommend] = useState(false);
  const [recommendCrawlProperties, setRecommendCrawlProperties] = useState<
    CrawlingPropertyResDto[]
  >([]);
  const [isLoadingRecommendCrawl, setIsLoadingRecommendCrawl] = useState(false);

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

  const handleSmsPageChange = (page: number) => {
    setSmsCurrentPage(page);
  };

  // 추천 매물 로드 함수
  const loadRecommendProperties = useCallback(async () => {
    if (!id) return;

    setIsLoadingRecommend(true);
    try {
      const response = await getCustomerRecommendProperties(Number(id), 5);
      if (response.success && response.data) {
        setRecommendProperties(response.data);
      } else {
        showToast(response.message || '추천 매물을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to load recommend properties:', error);
      showToast('추천 매물을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoadingRecommend(false);
    }
  }, [id, showToast]);

  // 공개 매물 로드 함수
  const loadRecommendCrawlProperties = useCallback(async () => {
    if (!id) return;

    setIsLoadingRecommendCrawl(true);
    try {
      const response = await getCustomerRecommendCrawlProperties(Number(id), 5);
      if (response.success && response.data) {
        setRecommendCrawlProperties(response.data);
      } else {
        showToast(response.message || '추천 공개 매물을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to load recommend crawl properties:', error);
      showToast('추천 공개 매물을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoadingRecommendCrawl(false);
    }
  }, [id, showToast]);

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
          case 'sms':
            response = await getCustomerSms(Number(id), smsCurrentPage, pageSize);
            if (response.success && response.data) {
              setSmsList(response.data);
            }
            break;
          case 'recommend':
            await loadRecommendProperties();
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
    smsCurrentPage,
    loadRecommendProperties,
  ]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (activeTab === 'recommend' && activeRecommendTab === 'public') {
      loadRecommendCrawlProperties();
    }
  }, [activeTab, activeRecommendTab, loadRecommendCrawlProperties]);

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 왼쪽 컨테이너: 기본 정보와 태그 */}
            <div className="space-y-8">
              {/* 기본 정보 카드 */}
              <Card className="overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                    기본 정보
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500">이름</p>
                        <p className="text-gray-900 truncate">{customer.name || '미등록'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <Phone size={20} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500">연락처</p>
                        <p className="text-gray-900 truncate">
                          {formatPhoneNumber(customer.contact)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <Mail size={20} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500">이메일</p>
                        <p className="text-gray-900 truncate">{customer.email || '미등록'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <Calendar size={20} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500">생년월일 / 성별</p>
                        <p className="text-gray-900 truncate">
                          {customer.birthDate || '미등록'} /{' '}
                          {customer.gender === 'M'
                            ? '남성'
                            : customer.gender === 'F'
                              ? '여성'
                              : '미등록'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors md:col-span-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <FileText size={20} className="text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-500">메모</p>
                        <p className="text-gray-900 whitespace-pre-line">
                          {customer.memo || '미등록'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 태그 정보 카드 */}
              <Card className="overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                    태그
                  </h2>
                  {customer.tags && customer.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {customer.tags.map((tag) => (
                        <span
                          key={tag.tagId}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                        >
                          <Tag size={14} className="mr-1.5" />
                          {tag.type}: {tag.value}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">등록된 태그가 없습니다.</p>
                  )}
                </div>
              </Card>
            </div>

            {/* 오른쪽 컨테이너: 상담/계약/문의 내역 */}
            <div className="space-y-8">
              <Card className="overflow-hidden">
                <div className="p-6">
                  {/* 탭 메뉴 */}
                  <div className="border-b border-gray-200 mb-2">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setActiveTab('consultation')}
                        className={`${
                          activeTab === 'consultation'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
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
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
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
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                      >
                        <MessageSquare size={16} />
                        <span>문의 내역</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('sms')}
                        className={`${
                          activeTab === 'sms'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                      >
                        <MessageSquare size={16} />
                        <span>문자 내역</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('recommend')}
                        className={`${
                          activeTab === 'recommend'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                      >
                        <Home size={16} />
                        <span>추천 매물</span>
                      </button>
                    </nav>
                  </div>

                  {/* 탭 컨텐츠 */}
                  <div className="mt-2">
                    {activeTab === 'consultation' && (
                      <div>
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
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              상담 내역 없음
                            </h3>
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
                                {
                                  length: Math.ceil(
                                    consultations.pagination.totalElements / pageSize
                                  ),
                                },
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
                                    {/* <p className="text-sm text-gray-500">
                                      {contract.startedAt
                                        ? new Date(contract.startedAt).toLocaleDateString('ko-KR')
                                        : '날짜 정보 없음'}
                                    </p> */}
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
                                {
                                  length: Math.ceil(contracts.pagination.totalElements / pageSize),
                                },
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
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              문의 내역 없음
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              아직 기록된 문의 내역이 없습니다.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'sms' && (
                      <div>
                        {smsList?.content && smsList.content.length > 0 ? (
                          <div className="space-y-4">
                            {smsList.content.map((sms) => (
                              <div
                                key={sms.id}
                                className="flex items-center border rounded px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                                onClick={() => {
                                  setSelectedSms(sms);
                                  setIsSmsModalOpen(true);
                                }}
                              >
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full mr-2 ${sms.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                >
                                  {sms.status === 'SUCCESS' ? '성공' : '실패'}
                                </span>
                                <span className="font-medium text-gray-900 mr-2">
                                  {sms.msgType}
                                </span>
                                <span
                                  className="truncate max-w-[300px] text-gray-700 mr-2"
                                  title={sms.msg}
                                >
                                  {sms.msg}
                                </span>
                                <span className="ml-auto text-gray-400">
                                  {sms.createdAt
                                    ? new Date(sms.createdAt).toLocaleString('ko-KR')
                                    : '날짜 정보 없음'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              문자 내역 없음
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              아직 기록된 문자 내역이 없습니다.
                            </p>
                          </div>
                        )}
                        {/* 페이지네이션 */}
                        {smsList && (
                          <div className="mt-4 flex justify-center">
                            <div className="flex space-x-2">
                              {Array.from(
                                { length: Math.ceil(smsList.pagination.totalElements / pageSize) },
                                (_, i) => (
                                  <button
                                    key={i + 1}
                                    onClick={() => handleSmsPageChange(i + 1)}
                                    className={`px-3 py-1 rounded ${smsCurrentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
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

                    {activeTab === 'recommend' && (
                      <div>
                        <div className="border-b border-gray-200 mb-4">
                          <nav className="-mb-px flex space-x-8">
                            <button
                              onClick={() => setActiveRecommendTab('my')}
                              className={`${
                                activeRecommendTab === 'my'
                                  ? 'border-blue-500 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                              내 매물
                            </button>
                            <button
                              onClick={() => setActiveRecommendTab('public')}
                              className={`${
                                activeRecommendTab === 'public'
                                  ? 'border-blue-500 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                              공개 매물
                            </button>
                          </nav>
                        </div>

                        {activeRecommendTab === 'my' ? (
                          <>
                            {isLoadingRecommend ? (
                              <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                              </div>
                            ) : recommendProperties.length > 0 ? (
                              <div className="space-y-4">
                                {recommendProperties.map((property) => (
                                  <div
                                    key={property.id}
                                    className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => navigate(`/properties/${property.id}`)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {PropertyTypeLabels[property.propertyType]}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {property.roadAddress}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {property.detailAddress}
                                        </p>
                                        <div className="mt-2 flex gap-2">
                                          {property.contractTypes.map((type) => (
                                            <span
                                              key={type}
                                              className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                                            >
                                              {type === 'SALE'
                                                ? '매매'
                                                : type === 'JEONSE'
                                                  ? '전세'
                                                  : '월세'}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <Home className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                  추천 매물 없음
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  현재 추천할 수 있는 매물이 없습니다.
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {isLoadingRecommendCrawl ? (
                              <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                              </div>
                            ) : recommendCrawlProperties.length > 0 ? (
                              <div className="space-y-4">
                                {recommendCrawlProperties.map((property) => (
                                  <div
                                    key={property.crawlingPropertiesId}
                                    className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex gap-4">
                                      {/* 왼쪽: 기본 정보 */}
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                          {PropertyTypeLabels[property.propertyType]}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {property.province} {property.city} {property.dong}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {property.detailAddress}
                                        </p>
                                        <div className="mt-2 flex gap-2">
                                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                            {PropertyDirectionLabels[property.direction]}
                                          </span>
                                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                            {property.roomCnt}룸 {property.bathRoomCnt}욕실
                                          </span>
                                        </div>
                                      </div>

                                      {/* 오른쪽: 가격 및 중개사 정보 */}
                                      <div className="flex-1 border-l border-gray-200 pl-4">
                                        <div className="space-y-2">
                                          <p className="text-sm text-gray-600">
                                            {property.area}㎡ · {property.floor}층/
                                            {property.allFloors}층
                                          </p>
                                          <p className="text-sm font-medium text-gray-900">
                                            {property.transactionType === 'SALE' ? (
                                              <>매매가: {property.salePrice}만원</>
                                            ) : (
                                              <>
                                                보증금: {property.deposit}만원
                                                {property.transactionType === 'MONTHLY' && (
                                                  <> · 월세: {property.monthlyRentFee}만원</>
                                                )}
                                              </>
                                            )}
                                          </p>
                                          <div className="pt-2 border-t border-gray-200">
                                            <p className="text-sm text-gray-600">
                                              {property.realEstateOfficeName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              {property.realEstateAgentName} ·{' '}
                                              {property.realEstateAgentContact}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <Home className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                  추천 공개 매물 없음
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  현재 추천할 수 있는 공개 매물이 없습니다.
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* 문자 상세 모달 */}
      <SmsDetailModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        sms={selectedSms}
      />
    </DashboardLayout>
  );
};

export default CustomerDetailPage;
