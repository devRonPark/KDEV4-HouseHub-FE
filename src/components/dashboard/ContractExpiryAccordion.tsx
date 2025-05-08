import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import MonthTabs from './MonthTabs';
import ContractList from './ContractList';
import { ExpiringContract } from '../../types/contract';
import { PaginationDto } from '../../types/pagination';

export default function ContractExpiryAccordion() {
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [contractsByMonth, setContractsByMonth] = useState<ExpiringContract[]>([]);
  const [paginationByMonth, setPaginationByMonth] = useState<PaginationDto>({
    totalPages: 0,
    totalElements: 0,
    size: 10,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    const generated = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      return date.toISOString().slice(0, 7);
    });
    setMonths(generated);
    setSelectedMonth(generated[0]);
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchContracts(selectedMonth, 1);
    }
  }, [selectedMonth]);

  const fetchContracts = async (month: string, page: number) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/dashboard/contracts/expiring`, {
        params: { yearMonth: month, page, size: 10 },
      });
      setContractsByMonth(res.data.data.content);
      setPaginationByMonth(res.data.data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-lg font-medium text-gray-900 mb-6">📆 6개월 이내 계약 만료 예정</h2>
      <MonthTabs
        months={months}
        selectedMonth={selectedMonth}
        onSelect={(month) => setSelectedMonth(month)}
      />
      <ContractList
        contracts={contractsByMonth}
        pagination={paginationByMonth}
        loading={loading}
        selectedMonth={selectedMonth}
        onPageChange={(page) => fetchContracts(selectedMonth, page)}
      />
    </section>
  );
}
