'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Select from '../../components/ui/Select';
import { getMyCustomers } from '../../api/customer';
import type { Customer } from '../../types/customer';
import { useToast } from '../../context/useToast';

interface CustomerDropdownProps {
  onCustomerSelect: (customerId: number | null, customer?: Customer | null) => void;
  selectedCustomerId?: number | null;
}

const CustomerDropdown: React.FC<CustomerDropdownProps> = ({
  onCustomerSelect,
  selectedCustomerId,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // 고객 목록 불러오기
  useEffect(() => {
    const fetchCustomers = async () => {
      if (isLoading) return; // 이미 로딩 중이면 중복 호출 방지

      setIsLoading(true);
      setError(null);

      try {
        const response = await getMyCustomers();
        if (response.success && response.data) {
          setCustomers(response.data);
        } else {
          setError(response.error || '고객 목록을 불러오는데 실패했습니다.');
          showToast(response.error || '고객 목록을 불러오는데 실패했습니다.', 'error');
        }
      } catch {
        const errorMessage = '고객 목록을 불러오는 중 오류가 발생했습니다.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [showToast]);

  // Select 컴포넌트에 사용할 옵션 생성
  const customerOptions = [
    { value: 'none', label: '고객 선택' },
    ...customers.map((customer) => ({
      value: customer.id.toString(),
      label: `${customer.name} (${customer.contact})`,
    })),
  ];

  // 고객 선택 핸들러
  const handleCustomerChange = (value: string) => {
    if (value === 'none') {
      onCustomerSelect(null);
    } else {
      const selectedCustomer = customers.find((customer) => customer.id.toString() === value);
      if (selectedCustomer) {
        onCustomerSelect(selectedCustomer.id, selectedCustomer);
      }
    }
  };

  // 선택된 고객 정보
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);

  return (
    <div className="w-full">
      <Select
        value={selectedCustomerId?.toString() || 'none'}
        onChange={handleCustomerChange}
        options={customerOptions}
        disabled={isLoading}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {selectedCustomer && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md">
          <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
          <p className="text-sm text-gray-500">{selectedCustomer.contact}</p>
          {selectedCustomer.email && (
            <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerDropdown;
