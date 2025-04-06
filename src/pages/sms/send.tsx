'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Plus, Calendar, Clock } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Card from '../../components/ui/Card';
import { useToast } from '../../context/useToast';
import { sendSms, getAllTemplates } from '../../api/smsApi';
import { getMyCustomers } from '../../api/customer';
import type { SendSmsReqDto, TemplateResDto } from '../../types/sms';
import type { CreateCustomerResDto } from '../../types/customer';
// At the top of the file, make sure useAuth is imported
import { useAuth } from '../../context/useAuth';

const SmsSendPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sender, setSender] = useState('');
  const [customers, setCustomers] = useState<CreateCustomerResDto[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  // Change the selectedCustomers state to store a single customer instead of an array
  const [selectedCustomer, setSelectedCustomer] = useState<CreateCustomerResDto | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'SMS' | 'LMS' | 'MMS'>('SMS');
  const [isReservation, setIsReservation] = useState(false);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [templates, setTemplates] = useState<TemplateResDto[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<CreateCustomerResDto[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  // Inside the SmsSendPage component, add this line near the other useState declarations
  const { user } = useAuth();

  // 템플릿 목록 조회
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await getAllTemplates();
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

  // 고객 목록 조회
  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await getMyCustomers();
      if (response.success && response.data) {
        setCustomers(response.data);
        setFilteredCustomers(response.data);
      } else {
        showToast(response.error || '고객 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('고객 목록 조회 오류:', error);
      showToast('고객 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoadingCustomers(false);
      console.log(isLoading);
    }
  };

  // Replace the existing useEffect for initial data loading with this updated version
  // that sets the sender to the user's contact number
  useEffect(() => {
    fetchTemplates();
    fetchCustomers();

    // Set sender to the current user's contact number
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

  // 검색어에 따른 고객 필터링
  useEffect(() => {
    let filtered = customers;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.includes(searchTerm) ||
          customer.contact.includes(searchTerm) ||
          (customer.email && customer.email.includes(searchTerm))
      );
    }

    // 그룹 필터링 - 연령대로 필터링하도록 수정
    if (activeFilter) {
      const ageGroup = Number.parseInt(activeFilter);
      filtered = filtered.filter((customer) => customer.ageGroup === ageGroup);
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, activeFilter, customers]);

  // 템플릿 선택 시 메시지 내용 업데이트
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId);
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

  // Replace the toggleCustomerSelection function with a selectCustomer function
  const selectCustomer = (customer: CreateCustomerResDto) => {
    setSelectedCustomer(customer === selectedCustomer ? null : customer);
  };

  // 필터 토글
  const toggleFilter = (filter: string) => {
    setActiveFilter((prev) => (prev === filter ? null : filter));
  };

  // Update the handleSendSms function to use a single receiver
  const handleSendSms = async () => {
    // 유효성 검사
    if (!sender) {
      showToast('발신 번호를 입력해주세요.', 'error');
      return;
    }

    if (!selectedCustomer) {
      showToast('수신자를 선택해주세요.', 'error');
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

    const smsData: SendSmsReqDto = {
      sender,
      receiver: selectedCustomer.contact,
      msg: message,
      msgType: messageType,
      title:
        messageType === 'LMS' || messageType === 'MMS'
          ? `${selectedCustomer.name}님 안내`
          : undefined,
      rtime,
      rdate,
      templateId: selectedTemplateId || undefined,
    };

    setIsSending(true);
    try {
      const response = await sendSms(smsData);
      if (response.success) {
        showToast('문자가 성공적으로 발송되었습니다.', 'success');
        navigate('/sms');
      } else {
        showToast(response.message || '문자 발송에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('문자 발송 오류:', error);
      showToast('문자 발송 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSending(false);
    }
  };

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
                  placeholder="이름으로 검색"
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>

              {/* 필터 버튼 */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFilter === '20'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleFilter('20')}
                >
                  20대
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFilter === '30'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleFilter('30')}
                >
                  30대
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFilter === '40'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleFilter('40')}
                >
                  40대
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFilter === '50'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleFilter('50')}
                >
                  50대 이상
                </button>
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
                    {/* Update the customer selection UI in the table */}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCustomers.map((customer) => (
                        <tr
                          key={customer.id}
                          className={`hover:bg-gray-50 cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''}`}
                          onClick={() => selectCustomer(customer)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.contact}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <input
                              type="radio"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-full"
                              checked={selectedCustomer?.id === customer.id}
                              onChange={() => selectCustomer(customer)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 오른쪽: 메시지 작성 */}
        <div className="lg:col-span-2">
          <Card title="메시지 작성" className="h-full">
            <div className="space-y-4">
              {/* Replace the existing sender input field with this read-only version */}
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
                <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                  템플릿 선택
                </label>
                <div className="flex space-x-2">
                  <Select
                    id="template"
                    value={selectedTemplateId?.toString() || ''}
                    onChange={(value) =>
                      setSelectedTemplateId(value ? Number.parseInt(value) : null)
                    }
                    options={[
                      { value: '', label: '템플릿을 선택하세요' },
                      ...templates.map((template) => ({
                        value: template.id.toString(),
                        label: template.title,
                      })),
                    ]}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => navigate('/sms/templates/create')}
                    className="whitespace-nowrap"
                  >
                    <Plus size={16} className="mr-1" />
                    템플릿 생성
                  </Button>
                </div>
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

              {/* Update the selected receiver display */}
              <div>
                <label className="block text-sm font-medium text-gray-700">선택된 수신자</label>
                <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 min-h-[60px]">
                  {selectedCustomer ? (
                    <div className="flex items-center bg-white px-2 py-1 rounded-md border border-gray-300 inline-block">
                      <span className="text-sm">
                        {selectedCustomer.name} ({selectedCustomer.contact})
                      </span>
                      <button
                        type="button"
                        className="ml-1 text-gray-400 hover:text-gray-600"
                        onClick={() => setSelectedCustomer(null)}
                      >
                        ✕
                      </button>
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
                {/* Update the send button disabled state */}
                <Button
                  variant="primary"
                  onClick={handleSendSms}
                  isLoading={isSending}
                  disabled={!sender || !selectedCustomer || !message}
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
