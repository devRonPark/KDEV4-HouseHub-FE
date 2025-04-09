'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Select from '../../components/ui/Select';
import { getMyCustomers } from '../../api/customer';
import type { Customer, CustomerSearchFilter } from '../../types/customer';
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
  // const [error, setError] = useState<string | null>(null);
  // const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searchBtnClicked, setSearchBtnClicked] = useState(false);
  const { showToast } = useToast();

  // 고객 검색 함수
  const searchCustomers = useCallback(async () => {
    if (isLoading) return; // 이미 로딩 중이면 중복 호출 방지

    setIsLoading(true);
    // setError(null);

    try {
      const filter: CustomerSearchFilter = {
        // keyword: searchKeyword,
        page: 1,
        size: 20,
      };

      const response = await getMyCustomers(filter);

      if (response.success && response.data) {
        // API 응답 구조에 따라 데이터 추출
        const customerData = response.data.content || response.data;
        setCustomers(Array.isArray(customerData) ? customerData : []);
      } else {
        // setError(response.error || '고객 목록을 불러오는데 실패했습니다.');
        showToast(response.error || '고객 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch {
      const errorMessage = '고객 목록을 불러오는 중 오류가 발생했습니다.';
      // setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, showToast]);

  // 검색 버튼 클릭 시 API 호출
  useEffect(() => {
    if (searchBtnClicked) {
      searchCustomers();
      setSearchBtnClicked(false); // 다시 false로 초기화
    }
  }, [searchBtnClicked, searchCustomers]);

  // 초기 로딩 (빈 검색어로 초기 데이터 로드)
  useEffect(() => {
    // 컴포넌트 마운트 시 초기 데이터 로드
    setSearchBtnClicked(true);
  }, []);

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
    <div className="w-full space-y-3">
      <Select
        value={selectedCustomerId?.toString() || 'none'}
        onChange={handleCustomerChange}
        options={customerOptions}
        disabled={isLoading}
      />

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
