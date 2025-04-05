'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'react-feather';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import CustomerForm from './CustomerForm';
import { formatDate, formatPhoneNumber } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import type { CreateCustomerReqDto, Customer } from '../../types/customer';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onUpdate: (customerData: CreateCustomerReqDto) => void;
  onDelete: (customer: Customer) => void;
}

const CustomerDetailModal = ({
  isOpen,
  onClose,
  customer,
  onUpdate,
  onDelete,
}: CustomerDetailModalProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      setIsLoading(false);
    }
  }, [customer, isOpen]);

  // 편집 취소
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSubmit = (data: Partial<Customer>) => {
    if (!customer) return;

    // id 필드 제외 및 CreateCustomerReqDto로 변환
    const requestData: CreateCustomerReqDto = {
      name: data.name || customer.name,
      email: data.email || customer.email,
      contact: data.contact || customer.contact,
      ageGroup: Number(data.ageGroup || customer.ageGroup),
      gender: data.gender === 'M' ? 'M' : 'F', // 타입 변환
      memo: data.memo || '',
    };

    onUpdate(requestData); // 변환된 데이터 전달
    setIsEditing(false);
  };

  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`고객 상세 정보: ${customer.name}`}
      size={isEditing ? 'lg' : 'md'}
    >
      {!isEditing && (
        <div className="flex justify-end space-x-2 mb-4">
          <Button
            variant="outline"
            leftIcon={<Edit size={16} />}
            onClick={() => setIsEditing(true)}
          >
            편집
          </Button>
          <Button
            variant="danger"
            leftIcon={<Trash2 size={16} />}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            삭제
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : isEditing ? (
        // 편집 모드: CustomerForm 사용
        <CustomerForm initialData={customer} onSubmit={handleSubmit} onCancel={handleCancelEdit} />
      ) : (
        // 보기 모드: 정보 표시
        <Card title="고객 정보" className="w-full">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">이름</h4>
              <p className="mt-1 text-gray-900">{customer.name}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">연락처</h4>
              <p className="mt-1">{formatPhoneNumber(customer.contact)}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">이메일</h4>
              <p className="mt-1">{customer.email}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">연령대</h4>
              <p className="mt-1">
                {customer.ageGroup}대 / {customer.gender === 'M' ? '남성' : '여성'}
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
      )}

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
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                onDelete(customer);
                setIsDeleteModalOpen(false);
                onClose();
              }}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};

export default CustomerDetailModal;
