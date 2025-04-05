'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2, ArrowLeft } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import CustomerForm from '../../components/customers/CustomerForm';
import { formatDate, formatPhoneNumber } from '../../utils/format';
import { useToast } from '../../context/useToast';
import type { Customer } from '../../types/customer';

// 임시 데이터 (실제로는 API에서 가져옴)
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: '김철수',
    email: 'kim@example.com',
    contact: '010-1234-5678',
    createdAt: '2023-01-15T09:30:00Z',
    updatedAt: '2023-03-20T14:45:00Z',
    memo: '자녀 교육 환경을 중요시하며, 역세권 선호. 투자 목적보다는 실거주 목적.',
    ageGroup: 30,
    gender: 'M',
  },
  {
    id: 2,
    name: '이영희',
    email: 'lee@example.com',
    contact: '010-9876-5432',
    createdAt: '2023-02-10T11:20:00Z',
    updatedAt: '2023-04-05T10:15:00Z',
    memo: '투자 목적으로 수익률이 좋은 매물 선호. 월세 수익 중요시.',
    ageGroup: 40,
    gender: 'F',
  },
];

const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 데이터 로딩 (실제로는 API 호출)
  useEffect(() => {
    const loadCustomerData = async () => {
      setIsLoading(true);
      try {
        // 실제 구현에서는 API 호출
        // const response = await fetchCustomer(id);
        // setCustomer(response.data);

        // 임시 데이터 사용
        setTimeout(() => {
          const foundCustomer = MOCK_CUSTOMERS.find((c) => c.id === Number(id));
          if (foundCustomer) {
            setCustomer(foundCustomer);
          } else {
            showToast('고객 정보를 찾을 수 없습니다.', 'error');
            navigate('/customers');
          }
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to load customer:', error);
        showToast('고객 정보를 불러오는데 실패했습니다.', 'error');
        setIsLoading(false);
        navigate('/customers');
      }
    };

    if (id) {
      loadCustomerData();
    }
  }, [id, navigate, showToast]);

  // 고객 정보 수정
  const handleUpdateCustomer = (customerData: Partial<Customer>) => {
    // 실제 구현에서는 API 호출
    // const response = await updateCustomer(id, customerData);

    // 임시 구현
    setCustomer((prev) => {
      if (!prev) return null;
      return { ...prev, ...customerData, updatedAt: new Date().toISOString() };
    });

    showToast('고객 정보가 성공적으로 수정되었습니다.', 'success');
    setIsEditModalOpen(false);
  };

  // 고객 삭제
  const handleDeleteCustomer = () => {
    // 실제 구현에서는 API 호출
    // await deleteCustomer(id);

    showToast('고객이 성공적으로 삭제되었습니다.', 'success');
    navigate('/customers');
  };

  if (isLoading || !customer) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="mr-4"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/customers')}
          >
            돌아가기
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            leftIcon={<Edit size={16} />}
            onClick={() => setIsEditModalOpen(true)}
          >
            수정
          </Button>
          <Button
            variant="danger"
            leftIcon={<Trash2 size={16} />}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            삭제
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 고객 정보 카드 */}
        <div className="lg:col-span-1">
          <Card title="고객 정보" className="h-full">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">연락처</h4>
                <p className="mt-1">{formatPhoneNumber(customer.contact)}</p>
                {customer.email && <p className="text-gray-600">{customer.email}</p>}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">인구통계</h4>
                <p className="mt-1">
                  {customer.ageGroup}대 / {customer.gender === 'M' ? '남성' : '여성'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">등록일</h4>
                <p className="mt-1">{formatDate(customer.createdAt)}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">최근 업데이트</h4>
                <p className="mt-1">
                  {customer.updatedAt ? formatDate(customer.updatedAt) : '업데이트 정보 없음'}
                </p>
              </div>

              {customer.memo && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">메모</h4>
                  <p className="mt-1 text-gray-700 whitespace-pre-line">{customer.memo}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 고객 정보 수정 모달 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="고객 정보 수정"
        size="lg"
      >
        <CustomerForm
          initialData={customer}
          onSubmit={handleUpdateCustomer}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* 고객 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="고객 삭제"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            정말로 <span className="font-semibold">{customer.name}</span> 고객을 삭제하시겠습니까?
            이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              취소
            </Button>
            <Button type="button" variant="danger" onClick={handleDeleteCustomer}>
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default CustomerDetailPage;
