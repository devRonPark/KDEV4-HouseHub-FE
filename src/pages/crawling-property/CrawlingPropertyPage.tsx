import { useState, useEffect } from 'react';
import { Search } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { searchCrawlingProperties } from '../../api/crawling-property';
import { 
  CrawlingPropertyItem, 
  CrawlingPropertyListResponse, 
  PaginationDto,
  CrawlingPropertyType,
  CrawlingTransactionType,
  CrawlingPropertySearchParams
} from '../../types/crawling-property';
import { useToast } from '../../context/useToast';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';

interface ToggleOption {
  id: string;
  label: string;
  isSelected: boolean;
}

interface PriceRange {
  min: string;
  max: string;
}

interface SearchResult {
  id: number;
  title: string;
  // TODO: 검색 결과 타입 정의 추가
}

export const CrawlingPropertyPage = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useState({
    province: '',
    city: '',
    dong: ''
  });

  const [contractTypes, setContractTypes] = useState<ToggleOption[]>([
    { id: 'SALE', label: '매매', isSelected: false },
    { id: 'JEONSE', label: '전세', isSelected: false },
    { id: 'MONTHLY', label: '월세', isSelected: false }
  ]);

  const [propertyTypes, setPropertyTypes] = useState<ToggleOption[]>([
    { id: 'APARTMENT', label: '아파트', isSelected: false },
    { id: 'OFFICETEL', label: '오피스텔', isSelected: false },
    { id: 'VILLA', label: '빌라', isSelected: false },
    { id: 'ONEROOM', label: '원룸', isSelected: false },
    { id: 'TWOROOM', label: '투룸', isSelected: false }
  ]);

  const [priceRanges, setPriceRanges] = useState<{
    sale: PriceRange;
    jeonse: PriceRange;
    deposit: PriceRange;
    monthly: PriceRange;
  }>({
    sale: { min: '', max: '' },
    jeonse: { min: '', max: '' },
    deposit: { min: '', max: '' },
    monthly: { min: '', max: '' }
  });

  const [searchResults, setSearchResults] = useState<CrawlingPropertyItem[]>([]);
  const [pagination, setPagination] = useState<PaginationDto>({
    currentPage: 1,
    totalPages: 1,
    totalElements: 0,
    size: 10
  });
  const [isLoading, setIsLoading] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState<CrawlingPropertyItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
      handlePageChange(pagination.currentPage);
  }, []); // currentPage가 변경될 때마다 실행

  const handleContractTypeToggle = (id: string) => {
    setContractTypes(prev =>
      prev.map(type => ({
        ...type,
        isSelected: type.id === id ? !type.isSelected : false
      }))
    );
  };

  const handlePropertyTypeToggle = (id: string) => {
    setPropertyTypes(prev =>
      prev.map(type =>
        type.id === id ? { ...type, isSelected: !type.isSelected } : type
      )
    );
  };

  const getSelectedContractType = () => {
    return contractTypes.find(type => type.isSelected)?.id || null;
  };

  const handlePriceRangeChange = (type: keyof typeof priceRanges, field: 'min' | 'max', value: string) => {
    setPriceRanges(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const selectedPropertyTypes = propertyTypes
        .filter(type => type.isSelected)
        .map(type => type.id as CrawlingPropertyType);

      const selectedContractType = getSelectedContractType();
      
      const params: CrawlingPropertySearchParams = {
        propertyTypes: selectedPropertyTypes.length > 0 ? selectedPropertyTypes[0] : undefined,
        transactionType: selectedContractType as CrawlingTransactionType || undefined,
        province: searchParams.province || undefined,
        city: searchParams.city || undefined,
        dong: searchParams.dong || undefined,
        page: 1, // 검색 시 항상 첫 페이지부터 조회
        size: pagination.size,
      };

      // 선택된 거래 유형에 따라 가격 범위 파라미터 추가
      if (selectedContractType === 'SALE' && (priceRanges.sale.min || priceRanges.sale.max)) {
        Object.assign(params, {
          minSalePrice: priceRanges.sale.min ? Number(priceRanges.sale.min) : undefined,
          maxSalePrice: priceRanges.sale.max ? Number(priceRanges.sale.max) : undefined,
        });
      } else if (selectedContractType === 'JEONSE' && (priceRanges.jeonse.min || priceRanges.jeonse.max)) {
        Object.assign(params, {
          minDeposit: priceRanges.jeonse.min ? Number(priceRanges.jeonse.min) : undefined,
          maxDeposit: priceRanges.jeonse.max ? Number(priceRanges.jeonse.max) : undefined,
        });
      } else if (selectedContractType === 'MONTHLY' && 
                (priceRanges.deposit.min || priceRanges.deposit.max || 
                 priceRanges.monthly.min || priceRanges.monthly.max)) {
        Object.assign(params, {
          minDeposit: priceRanges.deposit.min ? Number(priceRanges.deposit.min) : undefined,
          maxDeposit: priceRanges.deposit.max ? Number(priceRanges.deposit.max) : undefined,
          minMonthlyRentFee: priceRanges.monthly.min ? Number(priceRanges.monthly.min) : undefined,
          maxMonthlyRentFee: priceRanges.monthly.max ? Number(priceRanges.monthly.max) : undefined,
        });
      }

      const response = await searchCrawlingProperties(params);
      if (response.success && response.data) {
        setSearchResults(response.data.content);
        setPagination({
          ...response.data.pagination,
          currentPage: 1 // 검색 시 현재 페이지를 0으로 설정
        });
        if (response.data.content.length === 0) {
          showToast('검색 결과가 없습니다.', 'info');
        }
      } else {
        showToast(response.error || '매물 검색 중 오류가 발생했습니다.', 'error');
        setSearchResults([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalElements: 0,
          size: 10
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      showToast('매물 검색 중 오류가 발생했습니다.', 'error');
      setSearchResults([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalElements: 0,
        size: 10
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    try {
      const selectedPropertyTypes = propertyTypes
        .filter(type => type.isSelected)
        .map(type => type.id as CrawlingPropertyType);

      const selectedContractType = getSelectedContractType();
      
      const params: CrawlingPropertySearchParams = {
        propertyTypes: selectedPropertyTypes.length > 0 ? selectedPropertyTypes[0] : undefined,
        transactionType: selectedContractType as CrawlingTransactionType || undefined,
        province: searchParams.province || undefined,
        city: searchParams.city || undefined,
        dong: searchParams.dong || undefined,
        page: page,
        size: pagination.size,
      };

      // 선택된 거래 유형에 따라 가격 범위 파라미터 추가
      if (selectedContractType === 'SALE' && (priceRanges.sale.min || priceRanges.sale.max)) {
        Object.assign(params, {
          minSalePrice: priceRanges.sale.min ? Number(priceRanges.sale.min) : undefined,
          maxSalePrice: priceRanges.sale.max ? Number(priceRanges.sale.max) : undefined,
        });
      } else if (selectedContractType === 'JEONSE' && (priceRanges.jeonse.min || priceRanges.jeonse.max)) {
        Object.assign(params, {
          minDeposit: priceRanges.jeonse.min ? Number(priceRanges.jeonse.min) : undefined,
          maxDeposit: priceRanges.jeonse.max ? Number(priceRanges.jeonse.max) : undefined,
        });
      } else if (selectedContractType === 'MONTHLY' && 
                (priceRanges.deposit.min || priceRanges.deposit.max || 
                 priceRanges.monthly.min || priceRanges.monthly.max)) {
        Object.assign(params, {
          minDeposit: priceRanges.deposit.min ? Number(priceRanges.deposit.min) : undefined,
          maxDeposit: priceRanges.deposit.max ? Number(priceRanges.deposit.max) : undefined,
          minMonthlyRentFee: priceRanges.monthly.min ? Number(priceRanges.monthly.min) : undefined,
          maxMonthlyRentFee: priceRanges.monthly.max ? Number(priceRanges.monthly.max) : undefined,
        });
      }

      const response = await searchCrawlingProperties(params);
      if (response.success && response.data) {
        setSearchResults(response.data.content);
        setPagination(response.data.pagination);
      } else {
        showToast(response.error || '매물 검색 중 오류가 발생했습니다.', 'error');
      }
    } catch (error) {
      console.error('Page change failed:', error);
      showToast('매물 검색 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyClick = (property: CrawlingPropertyItem) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">크롤링 매물 목록</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* 검색 조건 카드 */}
          <div className="bg-white shadow rounded-lg mt-8">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    계약 유형
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {contractTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => handleContractTypeToggle(type.id)}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors
                          ${type.isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    매물 유형
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => handlePropertyTypeToggle(type.id)}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors
                          ${type.isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  지역
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchParams.province}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, province: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="도/특별시/광역시"
                  />
                  <input
                    type="text"
                    value={searchParams.city}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, city: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="시/군/구"
                  />
                  <input
                    type="text"
                    value={searchParams.dong}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, dong: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="읍/면/동"
                  />
                </div>
              </div>

              {/* 가격 범위 */}
              {getSelectedContractType() && (
                <div>
                  {getSelectedContractType() === 'SALE' && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          매매가
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={priceRanges.sale.min}
                            onChange={(e) => handlePriceRangeChange('sale', 'min', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="최소 가격"
                          />
                          <span className="text-gray-500">~</span>
                          <input
                            type="text"
                            value={priceRanges.sale.max}
                            onChange={(e) => handlePriceRangeChange('sale', 'max', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="최대 가격"
                          />
                          <span className="text-gray-500 w-8">원</span>
                        </div>
                      </div>
                      <button
                        onClick={handleSearch}
                        className="inline-flex items-center px-4 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap self-end"
                      >
                        <Search size={16} className="mr-2" />
                        검색
                      </button>
                    </div>
                  )}

                  {getSelectedContractType() === 'JEONSE' && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          전세가
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={priceRanges.jeonse.min}
                            onChange={(e) => handlePriceRangeChange('jeonse', 'min', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="최소 가격"
                          />
                          <span className="text-gray-500">~</span>
                          <input
                            type="text"
                            value={priceRanges.jeonse.max}
                            onChange={(e) => handlePriceRangeChange('jeonse', 'max', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="최대 가격"
                          />
                          <span className="text-gray-500 w-8">원</span>
                        </div>
                      </div>
                      <button
                        onClick={handleSearch}
                        className="inline-flex items-center px-4 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap self-end"
                      >
                        <Search size={16} className="mr-2" />
                        검색
                      </button>
                    </div>
                  )}

                  {getSelectedContractType() === 'MONTHLY' && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          보증금
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={priceRanges.deposit.min}
                            onChange={(e) => handlePriceRangeChange('deposit', 'min', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="보증금 최소"
                          />
                          <span className="text-gray-500">~</span>
                          <input
                            type="text"
                            value={priceRanges.deposit.max}
                            onChange={(e) => handlePriceRangeChange('deposit', 'max', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="보증금 최대"
                          />
                          <span className="text-gray-500 w-8">원</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          월세
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={priceRanges.monthly.min}
                            onChange={(e) => handlePriceRangeChange('monthly', 'min', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="월세 최소"
                          />
                          <span className="text-gray-500">~</span>
                          <input
                            type="text"
                            value={priceRanges.monthly.max}
                            onChange={(e) => handlePriceRangeChange('monthly', 'max', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="월세 최대"
                          />
                          <span className="text-gray-500 w-8">원</span>
                        </div>
                      </div>
                      <button
                        onClick={handleSearch}
                        className="inline-flex items-center px-4 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap self-end"
                      >
                        <Search size={16} className="mr-2" />
                        검색
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 검색 결과 카드 */}
          <div className="bg-white shadow rounded-lg mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                검색 결과
                {pagination && (
                  <span className="text-sm text-gray-500 ml-2">
                    총 {pagination.totalElements}건
                  </span>
                )}
              </h2>
            </div>
            
            {isLoading ? (
              <div className="p-6 text-center text-gray-500">
                검색 중...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {searchResults.map((property) => (
                  <div 
                    key={property.crawlingPropertiesId} 
                    className="p-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handlePropertyClick(property)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {property.detailAddress}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {property.area}m² · {property.floor}/{property.allFloors}층 · 
                          {property.roomCnt}방 {property.bathRoomCnt}욕실
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-blue-600">
                          {property.transactionType === 'SALE' && `${property.salePrice.toLocaleString()}만원`}
                          {property.transactionType === 'JEONSE' && `${property.deposit?.toLocaleString()}만원`}
                          {property.transactionType === 'MONTHLY' && 
                            `${property.deposit?.toLocaleString()}/${property.monthlyRentFee?.toLocaleString()}만원`}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {property.realEstateOfficeName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                검색 결과가 없습니다.
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {!isLoading && searchResults.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* 매물 상세 정보 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="매물 상세 정보"
        size="lg"
      >
        {selectedProperty && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{selectedProperty.detailAddress}</h3>
              <p className="text-gray-500">
                {selectedProperty.area}m² · {selectedProperty.floor}/{selectedProperty.allFloors}층 · 
                {selectedProperty.roomCnt}방 {selectedProperty.bathRoomCnt}욕실
              </p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-lg font-medium text-blue-600">
                {selectedProperty.transactionType === 'SALE' && `매매가: ${selectedProperty.salePrice.toLocaleString()}만원`}
                {selectedProperty.transactionType === 'JEONSE' && `전세가: ${selectedProperty.deposit?.toLocaleString()}만원`}
                {selectedProperty.transactionType === 'MONTHLY' && 
                  `보증금: ${selectedProperty.deposit?.toLocaleString()}만원 / 월세: ${selectedProperty.monthlyRentFee?.toLocaleString()}만원`}
              </p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900">중개사무소 정보</h4>
              <p className="text-gray-600">{selectedProperty.realEstateOfficeName}</p>
              <p className="text-gray-600">{selectedProperty.realEstateAgentName}</p>
              <p className="text-gray-600">{selectedProperty.realEstateAgentContact}</p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}; 