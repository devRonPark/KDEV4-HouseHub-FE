import { useState } from 'react';
import { CustomerResDto } from '../types/customer';

interface UseCustomerSelectionProps {
  onSelectCustomer: (customer: CustomerResDto) => void;
}

const useCustomerSelection = ({ onSelectCustomer }: UseCustomerSelectionProps) => {
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const handleCustomerSelect = (customer: CustomerResDto) => {
    onSelectCustomer(customer);
    setIsCustomerModalOpen(false);
  };

  const handleOpenCustomerModal = () => {
    setIsCustomerModalOpen(true);
  };

  const handleCloseCustomerModal = () => {
    setIsCustomerModalOpen(false);
  };

  return {
    isCustomerModalOpen,
    handleOpenCustomerModal,
    handleCloseCustomerModal,
    handleCustomerSelect,
  };
};

export default useCustomerSelection;
