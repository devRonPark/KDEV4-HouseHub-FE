import { useState, useEffect } from 'react';
import { Search } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  searchCrawlingPropertiesWithTags,
  getCrawlingPropertyById,
} from '../../api/crawling-property';
import {
  CrawlingPropertyItem,
  PaginationDto,
  CrawlingPropertyType,
  CrawlingTransactionType,
  CrawlingPropertySearchParams,
} from '../../types/crawling-property';
import { useToast } from '../../context/useToast';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { getCrawlingTags } from '../../api/crawling-tag';
import { CrawlingTagResDto } from '../../types/crawling-tag';
import { PropertyType } from '../../types/property';
import ToggleButtonGroup from '../../components/ui/ToggleButtonGroup';
import PriceRangeInput from '../../components/ui/PriceRangeInput';
import { ContractType } from '../../types/contract';
import PropertyCard from '../../components/crawling-property/PropertyCard';
import PropertyDetailContent from '../../components/crawling-property/PropertyDetailContent';

const initialContractTypes = [
  { id: 'SALE', label: '매매' },
  { id: 'JEONSE', label: '전세' },
  { id: 'MONTHLY_RENT', label: '월세' },
];

const initialPropertyTypes = [
  { id: 'APARTMENT', label: '아파트' },
  { id: 'OFFICETEL', label: '오피스텔' },
  { id: 'VILLA', label: '빌라' },
  { id: 'ONE_ROOM', label: '원룸' },
  { id: 'MULTIFAMILY', label: '다세대' },
  { id: 'SINGLEMULTIFAMILY', label: '단독/다가구' },
  { id: 'COMMERCIAL', label: '상가주택' },
  { id: 'ROWHOUSE', label: '연립' },
  { id: 'COUNTRYHOUSE', label: '전원' },
];

interface PriceRange {
  min: string;
  max: string;
}

export const CrawlingPropertyPage = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useState({
    province: '서울시',
    city: '마포구',
    dong: '',
  });
  const [selectedContractType, setSelectedContractType] = useState<ContractType | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | null>(null);

  const [priceRanges, setPriceRanges] = useState<{
    sale: PriceRange;
    jeonse: PriceRange;
    deposit: PriceRange;
    monthly: PriceRange;
  }>({
    sale: { min: '', max: '' },
    jeonse: { min: '', max: '' },
    deposit: { min: '', max: '' },
    monthly: { min: '', max: '' },
  });

  const [searchResults, setSearchResults] = useState<CrawlingPropertyItem[]>([]);
  const [pagination, setPagination] = useState<PaginationDto>({
    currentPage: 1,
    totalPages: 1,
    totalElements: 0,
    size: 10,
  });
  const [isLoading, setIsLoading] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState<CrawlingPropertyItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tags, setTags] = useState<CrawlingTagResDto[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showTags, setShowTags] = useState(false);

  useEffect(() => {
    handlePageChange(pagination.currentPage);
  }, []); // currentPage가 변경될 때마다 실행

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await getCrawlingTags();
        if (res.success && res.data) {
          setTags(res.data);
        } else {
          // API 호출은 성공했지만 데이터가 올바르지 않은 경우
          showToast('태그 정보를 불러오는데 실패했습니다.', 'error');
          setTags([]); // 태그 상태를 빈 배열로 초기화
        }
      } catch (e) {
        // API 호출 자체가 실패한 경우
        console.error('태그 조회 중 오류 발생:', e);
        showToast('태그 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
        setTags([]); // 태그 상태를 빈 배열로 초기화
      }
    };
    fetchTags();
  }, []);

  const handleContractTypeToggle = (contractType: ContractType) => {
    setSelectedContractType(contractType);
  };

  const handlePropertyTypeToggle = (propertyType: PropertyType) => {
    setSelectedPropertyType(propertyType);
  };

  const handlePriceRangeChange = (
    type: keyof typeof priceRanges,
    field: 'min' | 'max',
    value: string
  ) => {
    setPriceRanges((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleReset = () => {
    // 검색 조건 초기화
    setSearchParams({
      province: '',
      city: '',
      dong: '',
    });

    // 계약 유형 초기화
    setSelectedContractType(null);

    // 매물 유형 초기화
    setSelectedPropertyType(null);

    // 가격 범위 초기화
    setPriceRanges({
      sale: { min: '', max: '' },
      jeonse: { min: '', max: '' },
      deposit: { min: '', max: '' },
      monthly: { min: '', max: '' },
    });

    // 태그 선택 초기화
    setSelectedTags([]);

    // 태그 목록 접기
    setShowTags(false);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const params: CrawlingPropertySearchParams = {
        propertyType: (selectedPropertyType as CrawlingPropertyType) || undefined,
        transactionType: (selectedContractType as CrawlingTransactionType) || undefined,
        province: searchParams.province || undefined,
        city: searchParams.city || undefined,
        dong: searchParams.dong || undefined,
        page: 1,
        size: pagination.size,
        tagIds: selectedTags?.length ? selectedTags : [], // 태그가 없으면 기본 태그 배열 사용
      };

      // 선택된 거래 유형에 따라 가격 범위 파라미터 추가
      if (selectedContractType === 'SALE' && (priceRanges.sale.min || priceRanges.sale.max)) {
        Object.assign(params, {
          minSalePrice: priceRanges.sale.min ? Number(priceRanges.sale.min) : undefined,
          maxSalePrice: priceRanges.sale.max ? Number(priceRanges.sale.max) : undefined,
        });
      } else if (
        selectedContractType === 'JEONSE' &&
        (priceRanges.jeonse.min || priceRanges.jeonse.max)
      ) {
        Object.assign(params, {
          minDeposit: priceRanges.jeonse.min ? Number(priceRanges.jeonse.min) : undefined,
          maxDeposit: priceRanges.jeonse.max ? Number(priceRanges.jeonse.max) : undefined,
        });
      } else if (
        selectedContractType === 'MONTHLY_RENT' &&
        (priceRanges.deposit.min ||
          priceRanges.deposit.max ||
          priceRanges.monthly.min ||
          priceRanges.monthly.max)
      ) {
        Object.assign(params, {
          minDeposit: priceRanges.deposit.min ? Number(priceRanges.deposit.min) : undefined,
          maxDeposit: priceRanges.deposit.max ? Number(priceRanges.deposit.max) : undefined,
          minMonthlyRentFee: priceRanges.monthly.min ? Number(priceRanges.monthly.min) : undefined,
          maxMonthlyRentFee: priceRanges.monthly.max ? Number(priceRanges.monthly.max) : undefined,
        });
      }

      const response = await searchCrawlingPropertiesWithTags(params);
      if (response.success && response.data) {
        setSearchResults(response.data.content);
        setPagination({
          ...response.data.pagination,
          currentPage: 1, // 검색 시 현재 페이지를 0으로 설정
        });
      } else {
        setSearchResults([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalElements: 0,
          size: 10,
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalElements: 0,
        size: 10,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 선택된 거래 유형에 따라 가격 범위 파라미터 추가
  const getPriceRangeParams = (): Partial<CrawlingPropertySearchParams> => {
    if (selectedContractType === 'SALE') {
      return {
        minSalePrice: priceRanges.sale.min ? Number(priceRanges.sale.min) : undefined,
        maxSalePrice: priceRanges.sale.max ? Number(priceRanges.sale.max) : undefined,
      };
    }
    if (selectedContractType === 'JEONSE') {
      return {
        minDeposit: priceRanges.jeonse.min ? Number(priceRanges.jeonse.min) : undefined,
        maxDeposit: priceRanges.jeonse.max ? Number(priceRanges.jeonse.max) : undefined,
      };
    }
    if (selectedContractType === 'MONTHLY_RENT') {
      return {
        minDeposit: priceRanges.deposit.min ? Number(priceRanges.deposit.min) : undefined,
        maxDeposit: priceRanges.deposit.max ? Number(priceRanges.deposit.max) : undefined,
        minMonthlyRentFee: priceRanges.monthly.min ? Number(priceRanges.monthly.min) : undefined,
        maxMonthlyRentFee: priceRanges.monthly.max ? Number(priceRanges.monthly.max) : undefined,
      };
    }
    return {};
  };

  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    try {
      const params: CrawlingPropertySearchParams = {
        propertyType: (selectedPropertyType as CrawlingPropertyType) || undefined,
        transactionType: (selectedContractType as CrawlingTransactionType) || undefined,
        province: searchParams.province || '서울시', // 초기 화면에서 로딩이 너무 길기 때문에 전체 조회를 피하기 위해 초기값 설정
        city: searchParams.city || '마포구',
        dong: searchParams.dong || undefined,
        page: page,
        size: pagination.size,
        tagIds: selectedTags.length > 0 ? selectedTags : [],
        ...getPriceRangeParams(),
      };

      const response = await searchCrawlingPropertiesWithTags(params);
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

  const handlePropertyClick = async (id: string) => {
    try {
      const detail = await getCrawlingPropertyById(id);
      if (detail && detail.success && detail.data) {
        setSelectedProperty(detail.data);
        setIsModalOpen(true);
      } else {
        alert('상세 정보를 불러오지 못했습니다.');
      }
    } catch {
      alert('상세 정보를 불러오지 못했습니다.');
    }
  };

  // 태그 토글 핸들러
  // 태그 버튼을 누를 경우 태그 id를 반환하는 함수
  // 함수 외부에서 태그 id 리스트를 생성
  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // type별로 태그를 그룹화하는 함수
  const groupTagsByType = (tags: CrawlingTagResDto[]) => {
    return tags.reduce(
      (acc, tag) => {
        if (!acc[tag.type]) acc[tag.type] = [];
        acc[tag.type].push(tag);
        return acc;
      },
      {} as Record<string, CrawlingTagResDto[]>
    );
  };

  const groupedTags = groupTagsByType(tags);

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
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">검색 조건</h2>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  전체 초기화
                </button>
              </div>
              <div className="space-y-6">
                <ToggleButtonGroup
                  label="계약 유형"
                  options={initialContractTypes.map((type) => ({
                    ...type,
                    isSelected: type.id === selectedContractType,
                  }))}
                  onToggle={(id) => handleContractTypeToggle(id as ContractType)}
                />
              </div>
              <div className="space-y-6">
                <ToggleButtonGroup
                  label="매물 유형"
                  options={initialPropertyTypes.map((type) => ({
                    ...type,
                    isSelected: type.id === selectedPropertyType,
                  }))}
                  onToggle={(id) => handlePropertyTypeToggle(id as PropertyType)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">지역</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchParams.province}
                    onChange={(e) =>
                      setSearchParams((prev) => ({ ...prev, province: e.target.value }))
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="도/특별시/광역시"
                  />
                  <input
                    type="text"
                    value={searchParams.city}
                    onChange={(e) => setSearchParams((prev) => ({ ...prev, city: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="시/군/구"
                  />
                  <input
                    type="text"
                    value={searchParams.dong}
                    onChange={(e) => setSearchParams((prev) => ({ ...prev, dong: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="읍/면/동"
                  />
                </div>
              </div>

              {/* 가격 범위 */}
              {selectedContractType && (
                <div>
                  {selectedContractType === 'SALE' && (
                    <div className="flex items-center space-x-4">
                      <PriceRangeInput
                        label="매매가"
                        minValue={priceRanges.sale.min}
                        maxValue={priceRanges.sale.max}
                        onChangeMin={(v) => handlePriceRangeChange('sale', 'min', v)}
                        onChangeMax={(v) => handlePriceRangeChange('sale', 'max', v)}
                      />
                    </div>
                  )}

                  {selectedContractType === 'JEONSE' && (
                    <div className="flex items-center space-x-4">
                      <PriceRangeInput
                        label="전세가"
                        minValue={priceRanges.jeonse.min}
                        maxValue={priceRanges.jeonse.max}
                        onChangeMin={(v) => handlePriceRangeChange('jeonse', 'min', v)}
                        onChangeMax={(v) => handlePriceRangeChange('jeonse', 'max', v)}
                      />
                    </div>
                  )}

                  {selectedContractType === 'MONTHLY_RENT' && (
                    <div className="flex items-center space-x-4">
                      <PriceRangeInput
                        label="보증금"
                        minValue={priceRanges.deposit.min}
                        maxValue={priceRanges.deposit.max}
                        onChangeMin={(v) => handlePriceRangeChange('deposit', 'min', v)}
                        onChangeMax={(v) => handlePriceRangeChange('deposit', 'max', v)}
                      />
                      <PriceRangeInput
                        label="월세"
                        minValue={priceRanges.monthly.min}
                        maxValue={priceRanges.monthly.max}
                        onChangeMin={(v) => handlePriceRangeChange('monthly', 'min', v)}
                        onChangeMax={(v) => handlePriceRangeChange('monthly', 'max', v)}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center px-4 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
                >
                  <Search size={16} className="mr-2" />
                  검색
                </button>
              </div>

              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <button
                    type="button"
                    onClick={() => setShowTags((prev) => !prev)}
                    className={`mr-2 px-2 py-1 rounded border text-sm transition-colors ${showTags ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-black border-black'}`}
                  >
                    {showTags ? '▲' : '▼'}
                  </button>
                  <label className="block text-sm font-medium text-gray-700">태그 목록</label>
                </div>
                {showTags && (
                  <div className="space-y-4">
                    {Object.entries(groupedTags).map(([type, tagList]) => (
                      <div key={type}>
                        <div className="mb-1 text-sm font-semibold text-gray-700">{type}</div>
                        <div className="flex flex-wrap gap-2">
                          {tagList.map((tag) => (
                            <button
                              key={tag.tagId}
                              type="button"
                              onClick={() => handleTagToggle(tag.tagId)}
                              className={`px-3 py-1 rounded-full border text-sm transition-colors
                                ${
                                  selectedTags.includes(tag.tagId)
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-black border-black'
                                }`}
                            >
                              {tag.value}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              <div className="p-6 text-center text-gray-500">검색 중...</div>
            ) : Array.isArray(searchResults) && searchResults.length > 0 ? (
              <div className="divide-y">
                {searchResults.map((property) => (
                  <PropertyCard
                    key={property.crawlingPropertiesId}
                    property={property}
                    onClick={() => handlePropertyClick(property.crawlingPropertiesId)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">검색 결과가 없습니다.</div>
            )}
          </div>

          {/* 페이지네이션 */}
          {!isLoading && Array.isArray(searchResults) && searchResults.length > 0 && (
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
        {selectedProperty && <PropertyDetailContent property={selectedProperty} />}
      </Modal>
    </DashboardLayout>
  );
};
