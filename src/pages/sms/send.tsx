'use client';

import type React from 'react';

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Plus, Calendar, Clock, X } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Card from '../../components/ui/Card';
import { useToast } from '../../context/useToast';
import { sendSms, getAllTemplates } from '../../api/smsApi';
import { getMyCustomers } from '../../api/customer';
import type { SendSmsReqDto, SmsTemplateListResDto } from '../../types/sms';
import type { CreateCustomerResDto, CustomerListResDto } from '../../types/customer';
import { useAuth } from '../../context/useAuth';
import Pagination from '../../components/ui/Pagination';

const SmsSendPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sender, setSender] = useState('');
  const [customers, setCustomers] = useState<CustomerListResDto>();
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  // 단일 고객 선택에서 다중 고객 선택으로 변경
  const [selectedCustomers, setSelectedCustomers] = useState<CreateCustomerResDto[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'SMS' | 'LMS' | 'MMS'>('SMS');
  const [isReservation, setIsReservation] = useState(false);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [templates, setTemplates] = useState<SmsTemplateListResDto>({
    content: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      size: 10,
      totalElements: 0,
    },
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [filteredCustomers, setFilteredCustomers] = useState<CreateCustomerResDto[]>([]);
  const { user } = useAuth();

  // 필터 상태로 페이지네이션 관리
  const [filter, setFilter] = useState({
    keyword: '',
    page: 1,
    size: 5,
  });

  // 검색 버튼 클릭 상태
  const [searchBtnClicked, setSearchBtnClicked] = useState(false);

  // 템플릿 목록 조회
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const filter = {
        keyword: '',
        page: 1,
        size: 10,
      };
      const response = await getAllTemplates(filter);
      if (response.success && response.data) {
        setTemplates(response.data);
      } else {
        showToast(response.message || '템플릿 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('템플릿 목록 조회 오류:', error);
      showToast('템플릿 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 고객 목록 조회 함수
  const fetchCustomers = useCallback(async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await getMyCustomers(filter);
      if (response.success && response.data) {
        setCustomers(response.data);
        setFilteredCustomers(response.data.content);
      } else {
        showToast(response.error || '고객 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('고객 목록 조회 오류:', error);
      showToast('고객 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [filter, showToast]);

  // 초기 데이터 로딩
  useEffect(() => {
    fetchTemplates();
    fetchCustomers();

    // 발신자 번호 설정
    if (user && user.contact) {
      setSender(user.contact);
    }

    // URL 파라미터에서 templateId 가져오기
    const searchParams = new URLSearchParams(location.search);
    const templateId = searchParams.get('templateId');
    if (templateId) {
      setSelectedTemplateId(Number(templateId));
    }
  }, [location, user]);

  // 필터 변경 시 데이터 로드
  useEffect(() => {
    if (searchBtnClicked) {
      fetchCustomers();
      setSearchBtnClicked(false);
    }
  }, [filter, searchBtnClicked, fetchCustomers]);

  // 템플릿 선택 시 메시지 내용 업데이트
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates?.content.find((t) => t.id === selectedTemplateId);
      if (template) {
        setMessage(template.content);

        // 메시지 길이에 따라 메시지 타입 자동 설정
        if (template.content.length > 90) {
          setMessageType('LMS');
        } else {
          setMessageType('SMS');
        }
      }
    }
  }, [selectedTemplateId, templates]);

  // 메시지 길이에 따라 메시지 타입 자동 변경
  useEffect(() => {
    if (message.length > 90 && messageType === 'SMS') {
      setMessageType('LMS');
    }
  }, [message, messageType]);

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setFilter((prev) => ({
      ...prev,
      keyword: term,
    }));
  };

  // 검색 실행 함수
  const handleSearch = () => {
    setFilter((prev) => ({
      ...prev,
      page: 1, // 검색 시 첫 페이지로 초기화
    }));
    setSearchBtnClicked(true);
  };

  // 검색어 입력 시 Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setFilter((prev) => ({
      ...prev,
      page: newPage,
    }));
    setSearchBtnClicked(true);
  };

  // 검색 초기화
  const handleClearSearch = () => {
    setFilter({
      keyword: '',
      page: 1,
      size: 5,
    });
    setSearchBtnClicked(true);
  };

  // 고객 선택 토글 (다중 선택)
  const toggleCustomerSelection = (customer: CreateCustomerResDto) => {
    setSelectedCustomers((prev) => {
      // 이미 선택된 고객인지 확인
      const isSelected = prev.some((c) => c.id === customer.id);

      if (isSelected) {
        // 이미 선택된 경우 제거
        return prev.filter((c) => c.id !== customer.id);
      } else {
        // 선택되지 않은 경우 추가
        return [...prev, customer];
      }
    });
  };

  // 선택된 모든 고객 제거
  const clearAllSelectedCustomers = () => {
    setSelectedCustomers([]);
  };

  // 특정 고객 선택 제거
  const removeSelectedCustomer = (customerId: number) => {
    setSelectedCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  // 모든 고객 선택
  const selectAllCustomersOnPage = () => {
    // 현재 페이지의 모든 고객을 선택
    const currentPageCustomers = filteredCustomers || [];

    // 이미 선택된 고객 ID 목록
    const selectedIds = selectedCustomers.map((c) => c.id);

    // 현재 페이지에서 아직 선택되지 않은 고객만 추가
    const newCustomersToAdd = currentPageCustomers.filter((c) => !selectedIds.includes(c.id));

    setSelectedCustomers([...selectedCustomers, ...newCustomersToAdd]);
  };

  // SMS 발송 처리 (다중 수신자 지원)
  const handleSendSms = async () => {
    // 유효성 검사
    if (!sender) {
      showToast('발신 번호를 입력해주세요.', 'error');
      return;
    }

    if (selectedCustomers.length === 0) {
      showToast('수신자를 한 명 이상 선택해주세요.', 'error');
      return;
    }

    if (!message) {
      showToast('메시지 내용을 입력해주세요.', 'error');
      return;
    }

    // 예약 발송 시간 설정
    let rtime: string | undefined;
    let rdate: string | undefined;

    if (isReservation) {
      if (!reservationDate || !reservationTime) {
        showToast('예약 날짜와 시간을 모두 입력해주세요.', 'error');
        return;
      }

      // HH:MM 형식의 예약 시간
      rtime = reservationTime;

      // YYYYMMDD 형식의 예약 날짜
      rdate = reservationDate.replace(/-/g, '');
    }

    setIsSending(true);

    try {
      // 각 수신자에게 개별적으로 메시지 발송
      const sendPromises = selectedCustomers.map(async (customer) => {
        const smsData: SendSmsReqDto = {
          sender,
          receiver: customer.contact,
          msg: message,
          msgType: messageType,
          title:
            messageType === 'LMS' || messageType === 'MMS' ? `${customer.name}님 안내` : undefined,
          rtime,
          rdate,
          templateId: selectedTemplateId || undefined,
        };

        return sendSms(smsData);
      });

      // 모든 발송 요청 처리
      const results = await Promise.all(sendPromises);

      // 성공 및 실패 개수 확인
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        showToast(`${successCount}명의 수신자에게 문자가 성공적으로 발송되었습니다.`, 'success');
        navigate('/sms');
      } else if (successCount === 0) {
        showToast('모든 문자 발송에 실패했습니다.', 'error');
      } else {
        showToast(`${successCount}명 발송 성공, ${failCount}명 발송 실패했습니다.`, 'warning');
      }
    } catch (error) {
      console.error('문자 발송 오류:', error);
      showToast('문자 발송 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // 테이블에 표시할 항목 범위 계산
  const itemsPerPage = filter.size;
  const startIndex = customers?.pagination
    ? (customers.pagination.currentPage - 1) * itemsPerPage + 1
    : 0;
  const endIndex = customers?.pagination
    ? Math.min(customers.pagination.currentPage * itemsPerPage, customers.pagination.totalElements)
    : 0;

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">문자 보내기</h1>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 수신자 선택 */}
        <div className="lg:col-span-1">
          <Card title="수신자 검색" className="h-full">
            <div className="space-y-4">
              {/* 검색 입력 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="이름, 연락처, 이메일로 검색"
                  className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filter.keyword}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyPress}
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                {filter.keyword && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={selectAllCustomersOnPage}
                  size="sm"
                  disabled={filteredCustomers.length === 0}
                >
                  현재 페이지 모두 선택
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  leftIcon={<Search size={16} />}
                  size="sm"
                >
                  검색
                </Button>
              </div>

              {/* 고객 목록 */}
              <div className="mt-4">
                {isLoadingCustomers ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">검색 결과가 없습니다.</div>
                ) : (
                  <>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            이름
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            연락처
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            선택
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.map((customer) => (
                          <tr
                            key={customer.id}
                            className={`hover:bg-gray-50 cursor-pointer ${
                              selectedCustomers.some((c) => c.id === customer.id)
                                ? 'bg-blue-50'
                                : ''
                            }`}
                            onClick={() => toggleCustomerSelection(customer)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {customer.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {customer.contact}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={selectedCustomers.some((c) => c.id === customer.id)}
                                // onChange={() => toggleCustomerSelection(customer)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* 페이지네이션 */}
                    {customers?.pagination && customers.pagination.totalPages > 1 && (
                      <div className="mt-4 flex items-center justify-between">
                        <div className="hidden sm:block">
                          <p className="text-sm text-gray-700">
                            총{' '}
                            <span className="font-medium">
                              {customers.pagination.totalElements}
                            </span>
                            명의 고객 중 <span className="font-medium">{startIndex}</span>-
                            <span className="font-medium">{endIndex}</span>명 표시
                          </p>
                        </div>
                        <Pagination
                          currentPage={customers.pagination.currentPage}
                          totalPages={customers.pagination.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 오른쪽: 메시지 작성 */}
        <div className="lg:col-span-2">
          <Card title="메시지 작성" className="h-full">
            <div className="space-y-4">
              {/* 발신 번호 */}
              <div>
                <label htmlFor="sender" className="block text-sm font-medium text-gray-700">
                  발신 번호
                </label>
                <Input
                  id="sender"
                  value={sender}
                  placeholder="발신 번호 입력 (예: 010-1234-5678)"
                  required
                  disabled={true}
                  helperText="현재 로그인한 사용자의 전화번호로 고정됩니다."
                />
              </div>

              {/* 템플릿 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">템플릿 선택</label>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : templates.content.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    사용 가능한 템플릿이 없습니다.
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/sms/templates/create')}
                      className="ml-2"
                    >
                      <Plus size={16} className="mr-1" />
                      템플릿 생성
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={selectedTemplateId?.toString() || ''}
                    onChange={(value: string) => {
                      setSelectedTemplateId(value ? Number(value) : null);
                    }}
                    options={[
                      { value: '', label: '템플릿 선택' },
                      ...templates.content.map((template) => ({
                        value: template.id.toString(),
                        label: template.title,
                      })),
                    ]}
                  />
                )}
              </div>

              {/* 메시지 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">메시지 유형</label>
                <div className="mt-1 flex space-x-4">
                  <div className="flex items-center">
                    <input
                      id="sms"
                      name="messageType"
                      type="radio"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={messageType === 'SMS'}
                      onChange={() => setMessageType('SMS')}
                      disabled={message.length > 90}
                    />
                    <label htmlFor="sms" className="ml-2 block text-sm text-gray-700">
                      SMS (90자 이내)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="lms"
                      name="messageType"
                      type="radio"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={messageType === 'LMS'}
                      onChange={() => setMessageType('LMS')}
                    />
                    <label htmlFor="lms" className="ml-2 block text-sm text-gray-700">
                      LMS (2,000자 이내)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="mms"
                      name="messageType"
                      type="radio"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={messageType === 'MMS'}
                      onChange={() => setMessageType('MMS')}
                    />
                    <label htmlFor="mms" className="ml-2 block text-sm text-gray-700">
                      MMS (이미지 포함)
                    </label>
                  </div>
                </div>
              </div>

              {/* 메시지 내용 */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  메시지 내용
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="메시지 내용을 입력하세요"
                  rows={6}
                  required
                />
                <div className="mt-1 text-sm text-gray-500 flex justify-between">
                  <span>
                    {message.length}자 / {messageType === 'SMS' ? '90' : '2,000'}자
                  </span>
                  {messageType === 'SMS' && message.length > 90 && (
                    <span className="text-red-500">90자를 초과하여 LMS로 전환되었습니다.</span>
                  )}
                </div>
              </div>

              {/* 예약 발송 */}
              <div>
                <div className="flex items-center">
                  <input
                    id="reservation"
                    name="reservation"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={isReservation}
                    onChange={(e) => setIsReservation(e.target.checked)}
                  />
                  <label htmlFor="reservation" className="ml-2 block text-sm text-gray-700">
                    예약 발송
                  </label>
                </div>

                {isReservation && (
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="reservationDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        예약 날짜
                      </label>
                      <div className="mt-1 relative">
                        <Input
                          id="reservationDate"
                          type="date"
                          value={reservationDate}
                          onChange={(e) => setReservationDate(e.target.value)}
                          min={format(new Date(), 'yyyy-MM-dd')}
                          leftIcon={<Calendar size={18} />}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="reservationTime"
                        className="block text-sm font-medium text-gray-700"
                      >
                        예약 시간
                      </label>
                      <div className="mt-1 relative">
                        <Input
                          id="reservationTime"
                          type="time"
                          value={reservationTime}
                          onChange={(e) => setReservationTime(e.target.value)}
                          leftIcon={<Clock size={18} />}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 선택된 수신자 목록 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    선택된 수신자 ({selectedCustomers.length}명)
                  </label>
                  {selectedCustomers.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearAllSelectedCustomers}>
                      모두 지우기
                    </Button>
                  )}
                </div>
                <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 min-h-[100px] max-h-[200px] overflow-y-auto">
                  {selectedCustomers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="flex items-center bg-white px-2 py-1 rounded-md border border-gray-300"
                        >
                          <span className="text-sm">
                            {customer.name} ({customer.contact})
                          </span>
                          <button
                            type="button"
                            className="ml-1 text-gray-400 hover:text-gray-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSelectedCustomer(customer.id);
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-2">
                      선택된 수신자가 없습니다.
                    </div>
                  )}
                </div>
              </div>

              {/* 발송 버튼 */}
              <div className="pt-4 flex justify-end">
                <Button variant="outline" onClick={() => navigate('/sms')} className="mr-2">
                  취소
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSendSms}
                  isLoading={isSending}
                  disabled={!sender || selectedCustomers.length === 0 || !message}
                >
                  {isReservation ? '예약 발송' : '즉시 발송'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmsSendPage;
