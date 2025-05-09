'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { PropertyType, PropertyTypeLabels } from '../../types/property';
import { ContractType, ContractTypeLabels } from '../../types/contract';
import PriceRangeSlider from '../ui/PriceRangeSlider';
import TagSelector from '../tag/TagSelector';
import type { TagResDto } from '../../types/tag';
import { getTags } from '../../api/tag';

interface PriceRange {
  min: number;
  max: number;
}

interface DepositAndMonthlyRent {
  deposit: PriceRange;
  monthlyRent: PriceRange;
}

interface FilterValues {
  propertyType: PropertyType | null;
  contractType: ContractType | null;
  active: boolean | undefined;
  priceRanges: {
    [ContractType.JEONSE]: PriceRange;
    [ContractType.MONTHLY_RENT]: DepositAndMonthlyRent;
    [ContractType.SALE]: PriceRange;
  };
  tagIds: number[] | undefined;
}

interface PropertyFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues: FilterValues;
  onApplyFilters: (filters: FilterValues) => void;
}

const PropertyFilterModal: React.FC<PropertyFilterModalProps> = ({
  isOpen,
  onClose,
  initialValues,
  onApplyFilters,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialValues);
  const [tags, setTags] = useState<TagResDto[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // Reset filters to initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilters(initialValues);
    }
  }, [isOpen, initialValues]);

  // Fetch tags when modal opens
  useEffect(() => {
    const fetchTags = async () => {
      if (isOpen) {
        setIsLoadingTags(true);
        try {
          const response = await getTags();
          if (response.success && response.data) {
            setTags(response.data);
          }
        } catch (error) {
          console.error('Error fetching tags:', error);
        } finally {
          setIsLoadingTags(false);
        }
      }
    };

    fetchTags();
  }, [isOpen]);

  const handlePropertyTypeChange = (type: PropertyType) => {
    setFilters((prev) => ({
      ...prev,
      propertyType: prev.propertyType === type ? null : type,
    }));
  };

  const handleContractTypeChange = (type: ContractType) => {
    setFilters((prev) => ({
      ...prev,
      contractType: prev.contractType === type ? null : type,
    }));
  };

  const handleActiveStatusChange = (active: boolean | undefined) => {
    setFilters((prev) => ({
      ...prev,
      active,
    }));
  };

  const handlePriceRangeChange = (
    contractType: ContractType,
    field: string,
    value: [number, number]
  ) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (contractType === ContractType.MONTHLY_RENT) {
        if (field === 'deposit') {
          newFilters.priceRanges[ContractType.MONTHLY_RENT].deposit.min = value[0];
          newFilters.priceRanges[ContractType.MONTHLY_RENT].deposit.max = value[1];
        } else if (field === 'monthlyRent') {
          newFilters.priceRanges[ContractType.MONTHLY_RENT].monthlyRent.min = value[0];
          newFilters.priceRanges[ContractType.MONTHLY_RENT].monthlyRent.max = value[1];
        }
      } else {
        newFilters.priceRanges[contractType].min = value[0];
        newFilters.priceRanges[contractType].max = value[1];
      }

      return newFilters;
    });
  };

  const handleTagChange = (tagIds: number[]) => {
    setFilters((prev) => ({
      ...prev,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
    }));
  };

  const handleReset = () => {
    setFilters({
      propertyType: null,
      contractType: null,
      active: undefined,
      priceRanges: {
        [ContractType.JEONSE]: { min: 0, max: 100000 },
        [ContractType.MONTHLY_RENT]: {
          deposit: { min: 0, max: 100000 },
          monthlyRent: { min: 0, max: 300 },
        },
        [ContractType.SALE]: { min: 0, max: 100000 },
      },
      tagIds: undefined,
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  // Format price to Korean format (만원/억원)
  const formatPrice = (price: number): string => {
    if (price >= 10000) {
      const uk = Math.floor(price / 10000);
      const man = price % 10000;
      return man > 0 ? `${uk}억 ${man}만원` : `${uk}억원`;
    }
    return `${price}만원`;
  };

  // Format monthly rent price
  const formatMonthlyRent = (price: number): string => {
    return `${price}만원`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="매물 필터" size="md">
      <div className="space-y-6 px-5">
        {/* 매물 유형 선택 */}
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-2">매물 유형</h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(PropertyType).map((type) => (
              <button
                key={type}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  filters.propertyType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handlePropertyTypeChange(type)}
              >
                {PropertyTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* 계약 유형 선택 */}
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-2">계약 유형</h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(ContractType).map((type) => (
              <button
                key={type}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  filters.contractType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleContractTypeChange(type)}
              >
                {ContractTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* 가격 범위 - 계약 유형에 따라 다른 UI 표시 */}
        {filters.contractType === ContractType.JEONSE && (
          <div className="mt-4">
            <PriceRangeSlider
              label="전세가"
              min={0}
              max={100000}
              step={1000}
              value={[
                filters.priceRanges[ContractType.JEONSE].min,
                filters.priceRanges[ContractType.JEONSE].max,
              ]}
              onChange={(value: [number, number]) =>
                handlePriceRangeChange(ContractType.JEONSE, 'price', value)
              }
              formatValue={formatPrice}
              // markers={depositMarkers}
            />
          </div>
        )}

        {filters.contractType === ContractType.MONTHLY_RENT && (
          <>
            <div className="mt-4">
              <PriceRangeSlider
                label="보증금"
                min={0}
                max={100000}
                step={1000}
                value={[
                  filters.priceRanges[ContractType.MONTHLY_RENT].deposit.min,
                  filters.priceRanges[ContractType.MONTHLY_RENT].deposit.max,
                ]}
                onChange={(value: [number, number]) =>
                  handlePriceRangeChange(ContractType.MONTHLY_RENT, 'deposit', value)
                }
                formatValue={formatPrice}
                // markers={depositMarkers}
              />
            </div>

            <div className="mt-4">
              <PriceRangeSlider
                label="월세"
                min={0}
                max={300}
                step={5}
                value={[
                  filters.priceRanges[ContractType.MONTHLY_RENT].monthlyRent.min,
                  filters.priceRanges[ContractType.MONTHLY_RENT].monthlyRent.max,
                ]}
                onChange={(value: [number, number]) =>
                  handlePriceRangeChange(ContractType.MONTHLY_RENT, 'monthlyRent', value)
                }
                formatValue={formatMonthlyRent}
                // markers={monthlyRentMarkers}
              />
            </div>
          </>
        )}

        {filters.contractType === ContractType.SALE && (
          <div className="mt-4">
            <PriceRangeSlider
              label="매매가"
              min={0}
              max={100000}
              step={1000}
              value={[
                filters.priceRanges[ContractType.SALE].min,
                filters.priceRanges[ContractType.SALE].max,
              ]}
              onChange={(value: [number, number]) =>
                handlePriceRangeChange(ContractType.SALE, 'price', value)
              }
              formatValue={formatPrice}
            />
          </div>
        )}

        {/* 계약 가능 여부 */}
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-2">계약 가능 여부</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '전체', value: undefined },
              { label: '계약 가능', value: true },
              { label: '계약 불가능', value: false },
            ].map((option) => (
              <button
                key={String(option.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  filters.active === option.value
                    ? option.value === true
                      ? 'bg-green-500 text-white'
                      : option.value === false
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-800 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleActiveStatusChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 태그 선택 */}
        <TagSelector
          selectedTagIds={filters.tagIds || []}
          onTagChange={handleTagChange}
          className="mt-4"
        />
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          초기화
        </Button>
        <Button variant="primary" onClick={handleApply}>
          적용하기
        </Button>
      </div>
    </Modal>
  );
};

export default PropertyFilterModal;
