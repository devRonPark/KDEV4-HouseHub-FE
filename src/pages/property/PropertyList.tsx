'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, RefreshCw, Home, Filter } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import PropertyListItem from '../../components/property/PropertyListItem';
import PropertyFilterModal from '../../components/property/PropertyFilterModal';
import { useToast } from '../../context/useToast';
import { getProperties } from '../../api/property';
import type { PropertyType, FindPropertyResDto, PropertySearchFilter } from '../../types/property';
import type { PaginationDto } from '../../types/pagination';
import { ContractType } from '../../types/contract';
import ThreeLevelSelect from '../../components/region/ThreeLevelSelect';
import { regionNameMap } from '../../types/region';

const DEFAULT_MAX_PRICE = 100000;
const DEFAULT_MAX_MONTHLY_RENT = 300;
const PRICE_UNIT = 10000;

const PropertyList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<FindPropertyResDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto>({
    totalPages: 1,
    totalElements: 0,
    size: 10,
    currentPage: 1,
  });
  const [filter, setFilter] = useState<PropertySearchFilter>(getInitialFilter());
  const [searchBtnClicked, setSearchBtnClicked] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterModalValues, setFilterModalValues] = useState(getInitialFilterModalValues());
  const [selectedRegion, setSelectedRegion] = useState<{
    doCode?: string;
    doName?: string;
    sigunguCode?: string;
    sigunguName?: string;
    dongCode?: string;
    dongName?: string;
  }>({
    doCode: '',
    doName: '',
    sigunguCode: '',
    sigunguName: '',
    dongCode: '',
    dongName: '',
  });

  const handleRegionSelect = (region: typeof selectedRegion) => {
    setSelectedRegion(region);
  };

  function getInitialFilter(): PropertySearchFilter {
    return {
      province: '',
      city: '',
      dong: '',
      customerName: '',
      agentName: '',
      propertyType: null,
      contractType: undefined,
      active: undefined,
      tagIds: undefined,
      page: 1,
      size: 10,
    };
  }

  function getInitialFilterModalValues() {
    return {
      propertyType: null as PropertyType | null,
      contractType: null as ContractType | null,
      active: undefined as boolean | undefined,
      priceRanges: {
        [ContractType.JEONSE]: { min: 0, max: DEFAULT_MAX_PRICE },
        [ContractType.MONTHLY_RENT]: {
          deposit: { min: 0, max: DEFAULT_MAX_PRICE },
          monthlyRent: { min: 0, max: DEFAULT_MAX_MONTHLY_RENT },
        },
        [ContractType.SALE]: { min: 0, max: DEFAULT_MAX_PRICE },
      },
      tagIds: undefined as number[] | undefined,
    };
  }

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getProperties(filter);
      if (response.success && response.data) {
        setProperties(response.data.content || []);
        setPagination(response.data.pagination);
      } else {
        setProperties([]);
        setPagination({ totalPages: 1, totalElements: 0, size: 10, currentPage: 1 });
        showToast(response.error || '매물 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      showToast('매물 목록을 불러오는 중 오류가 발생했습니다.', 'error');
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  const handlePageChange = (page: number) => {
    setFilter((prev) => ({ ...prev, page }));
    setSearchBtnClicked(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter((prev) => ({
      ...prev,
      province:
        selectedRegion.doName && regionNameMap[selectedRegion.doName]
          ? regionNameMap[selectedRegion.doName]
          : selectedRegion.doName || '',
      city: selectedRegion.sigunguName || '',
      dong: selectedRegion.dongName || '',
      customerName: filter.customerName,
      agentName: filter.agentName,
      page: 1,
    }));
    setSearchBtnClicked(true);
  };

  const openFilterModal = () => {
    const {
      propertyType,
      contractType,
      active,
      minPrice,
      maxPrice,
      minDeposit,
      maxDeposit,
      minMonthlyRent,
      maxMonthlyRent,
      tagIds,
    } = filter;
    setFilterModalValues({
      propertyType,
      contractType: contractType || null,
      active,
      priceRanges: {
        [ContractType.JEONSE]: {
          min: minPrice || 0,
          max:
            maxPrice === null
              ? DEFAULT_MAX_PRICE
              : maxPrice === undefined
                ? DEFAULT_MAX_PRICE
                : maxPrice / PRICE_UNIT,
        },
        [ContractType.MONTHLY_RENT]: {
          deposit: {
            min: minDeposit || 0,
            max:
              maxDeposit === null
                ? DEFAULT_MAX_PRICE
                : maxDeposit === undefined
                  ? DEFAULT_MAX_PRICE
                  : maxDeposit / PRICE_UNIT,
          },
          monthlyRent: {
            min: minMonthlyRent || 0,
            max:
              maxMonthlyRent === null
                ? DEFAULT_MAX_MONTHLY_RENT
                : maxMonthlyRent === undefined
                  ? DEFAULT_MAX_MONTHLY_RENT
                  : maxMonthlyRent,
          },
        },
        [ContractType.SALE]: {
          min: minPrice || 0,
          max:
            maxPrice === null
              ? DEFAULT_MAX_PRICE
              : maxPrice === undefined
                ? DEFAULT_MAX_PRICE
                : maxPrice / PRICE_UNIT,
        },
      },
      tagIds,
    });
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = (filterValues: typeof filterModalValues) => {
    const newFilter: PropertySearchFilter = { ...filter, page: 1 };
    newFilter.propertyType = filterValues.propertyType;
    newFilter.contractType = filterValues.contractType || undefined;
    newFilter.active = filterValues.active;
    newFilter.tagIds = filterValues.tagIds;

    const jeonseRange = filterValues.priceRanges[ContractType.JEONSE];
    const monthlyRentRange = filterValues.priceRanges[ContractType.MONTHLY_RENT];
    const saleRange = filterValues.priceRanges[ContractType.SALE];

    newFilter.minPrice = undefined;
    newFilter.maxPrice = undefined;
    newFilter.minDeposit = undefined;
    newFilter.maxDeposit = undefined;
    newFilter.minMonthlyRent = undefined;
    newFilter.maxMonthlyRent = undefined;

    if (filterValues.contractType === ContractType.JEONSE) {
      newFilter.minPrice = jeonseRange.min * PRICE_UNIT;
      newFilter.maxPrice =
        jeonseRange.max === DEFAULT_MAX_PRICE ? undefined : jeonseRange.max * PRICE_UNIT;
    } else if (filterValues.contractType === ContractType.MONTHLY_RENT) {
      newFilter.minDeposit = monthlyRentRange.deposit.min * PRICE_UNIT;
      newFilter.maxDeposit =
        monthlyRentRange.deposit.max === DEFAULT_MAX_PRICE
          ? undefined
          : monthlyRentRange.deposit.max * PRICE_UNIT;
      newFilter.minMonthlyRent = monthlyRentRange.monthlyRent.min;
      newFilter.maxMonthlyRent =
        monthlyRentRange.monthlyRent.max === DEFAULT_MAX_MONTHLY_RENT
          ? undefined
          : monthlyRentRange.monthlyRent.max;
    } else if (filterValues.contractType === ContractType.SALE) {
      newFilter.minPrice = saleRange.min * PRICE_UNIT;
      newFilter.maxPrice =
        saleRange.max === DEFAULT_MAX_PRICE ? undefined : saleRange.max * PRICE_UNIT;
    }

    setFilter(newFilter);
    setSearchBtnClicked(true);
  };

  const resetFilters = () => {
    setFilter(getInitialFilter());
    setSelectedRegion({
      doCode: undefined,
      doName: undefined,
      sigunguCode: undefined,
      sigunguName: undefined,
      dongCode: undefined,
      dongName: undefined,
    });
    setSearchBtnClicked(true);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (searchBtnClicked) {
      console.log('필터:', filter);
      fetchProperties();
      setSearchBtnClicked(false);
    }
  }, [searchBtnClicked]);

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">매물 관리</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Button
            variant="primary"
            onClick={() => navigate('/properties/register')}
            leftIcon={<Plus size={16} />}
          >
            매물 등록
          </Button>
        </div>
      </div>

      <div className="mt-6 bg-white shadow rounded-lg p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <ThreeLevelSelect
              onRegionSelect={handleRegionSelect}
              initialDoCode={selectedRegion.doCode}
              initialSigunguCode={selectedRegion.sigunguCode}
              initialDongCode={selectedRegion.dongCode}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              placeholder="고객 이름"
              value={filter.customerName}
              onChange={(e) => setFilter({ ...filter, customerName: e.target.value })}
              leftIcon={<Search size={18} />}
            />
          </div>

          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                검색
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={openFilterModal}
                leftIcon={<Filter size={16} />}
              >
                상세 필터
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={resetFilters}>
                필터 초기화
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={fetchProperties}
                leftIcon={<RefreshCw size={14} />}
              >
                새로고침
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4 animate-pulse">
                <div className="flex items-start">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="space-y-4">
            {properties.map((property) => (
              <PropertyListItem key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Home className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">매물 없음</h3>
            <p className="mt-1 text-sm text-gray-500">
              {Object.values(filter).some((value) => !!value)
                ? '검색 조건에 맞는 매물이 없습니다.'
                : '등록된 매물이 없습니다.'}
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => navigate('/properties/register')}
                leftIcon={<Plus size={16} />}
              >
                매물 등록
              </Button>
            </div>
          </div>
        )}
      </div>

      {!isLoading && properties.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <PropertyFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialValues={filterModalValues}
        onApplyFilters={handleApplyFilters}
      />
    </DashboardLayout>
  );
};

export default PropertyList;
