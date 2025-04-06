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
import type { SendSmsReqDto, TemplateResDto } from '../../types/sms';

// 임시 고객 데이터
const MOCK_CUSTOMERS = [
  { id: 1, name: '김영희', contact: '010-1234-5678', group: '임대 희망자' },
  { id: 2, name: '이철수', contact: '010-9876-5432', group: '매매 희망자' },
  { id: 3, name: '박민지', contact: '010-2468-1357', group: '전세 희망자' },
];

const SmsSendPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sender, setSender] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<typeof MOCK_CUSTOMERS>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'SMS' | 'LMS' | 'MMS'>('SMS');
  const [isReservation, setIsReservation] = useState(false);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [templates, setTemplates] = useState<TemplateResDto[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState(MOCK_CUSTOMERS);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

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

  // 초기 데이터 로딩
  useEffect(() => {
    fetchTemplates();

    // URL 파라미터에서 templateId 가져오기
    const searchParams = new URLSearchParams(location.search);
    const templateId = searchParams.get('templateId');
    if (templateId) {
      setSelectedTemplateId(Number(templateId));
    }
  }, [location]);

  // 검색어에 따른 고객 필터링
  useEffect(() => {
    let filtered = MOCK_CUSTOMERS;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) => customer.name.includes(searchTerm) || customer.contact.includes(searchTerm)
      );
    }

    // 그룹 필터링
    if (activeFilter) {
      filtered = filtered.filter((customer) => customer.group === activeFilter);
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, activeFilter]);

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

  // 고객 선택/해제
  const toggleCustomerSelection = (customer: (typeof MOCK_CUSTOMERS)[0]) => {
    setSelectedCustomers((prev) => {
      const isSelected = prev.some((c) => c.id === customer.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== customer.id);
      } else {
        return [...prev, customer];
      }
    });
  };

  // 필터 토글
  const toggleFilter = (filter: string) => {
    setActiveFilter((prev) => (prev === filter ? null : filter));
  };

  // 문자 발송
  const handleSendSms = async () => {
    // 유효성 검사
    if (!sender) {
      showToast('발신 번호를 입력해주세요.', 'error');
      return;
    }

    if (selectedCustomers.length === 0) {
      showToast('수신자를 선택해주세요.', 'error');
      return;
    }

    if (!message) {
      showToast('메시지 내용을 입력해주세요.', 'error');
      return;
    }

    // 예약 발송 시간 설정
    let reservationDateTime: string | undefined;
    if (isReservation) {
      if (!reservationDate || !reservationTime) {
        showToast('예약 날짜와 시간을 모두 입력해주세요.', 'error');
        return;
      }
      reservationDateTime = `${reservationDate}T${reservationTime}:00`;
    }

    const smsData: SendSmsReqDto = {
      sender,
      receivers: selectedCustomers.map((c) => c.contact),
      message,
      messageType,
      reservationTime: reservationDateTime,
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
                    activeFilter === '임대 희망자'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleFilter('임대 희망자')}
                >
                  임대 희망자
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFilter === '매매 희망자'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleFilter('매매 희망자')}
                >
                  매매 희망자
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFilter === '전세 희망자'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleFilter('전세 희망자')}
                >
                  전세 희망자
                </button>
              </div>

              {/* 고객 목록 */}
              <div className="mt-4">
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
                      <tr key={customer.id} className="hover:bg-gray-50">
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
                            onChange={() => toggleCustomerSelection(customer)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="발신 번호 입력 (예: 010-1234-5678)"
                  required
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

              {/* 선택된 수신자 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  선택된 수신자 ({selectedCustomers.length}명)
                </label>
                <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 max-h-32 overflow-y-auto">
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
                            onClick={() => toggleCustomerSelection(customer)}
                          >
                            ✕
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
