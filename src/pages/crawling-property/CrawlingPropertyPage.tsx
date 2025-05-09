import { useState, useEffect } from 'react';
import { Search } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { searchCrawlingPropertiesWithTags, getCrawlingPropertyById } from '../../api/crawling-property';
import { 
  CrawlingPropertyItem,
  PaginationDto,
  CrawlingPropertyType,
  CrawlingTransactionType,
  CrawlingPropertySearchParams
} from '../../types/crawling-property';
import { useToast } from '../../context/useToast';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { getCrawlingTags } from '../../api/crawling-tag';
import { CrawlingTagResDto } from '../../types/crawling-tag';
import { PropertyType } from '../../types/property';

interface ToggleOption {
  id: string;
  label: string;
  isSelected: boolean;
}

interface PriceRange {
  min: string;
  max: string;
}

const propertyTypeKoreanMap = {
  MULTIFAMILY: '다세대',
  SINGLEMULTIFAMILY: '단독/다가구',
  VILLA: '빌라',
  COMMERCIAL: '상가주택',
  APARTMENT: '아파트',
  ROWHOUSE: '연립',
  OFFICETEL: '오피스텔',
  ONE_ROOM: '원룸',
  COUNTRYHOUSE: '전원'
};

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

  const [propertyTypes] = useState<ToggleOption[]>([
    { id: 'APARTMENT', label: '아파트', isSelected: false },
    { id: 'OFFICETEL', label: '오피스텔', isSelected: false },
    { id: 'VILLA', label: '빌라', isSelected: false },
    { id: 'ONE_ROOM', label: '원룸', isSelected: false },
    { id: 'MULTIFAMILY', label: '다세대', isSelected: false },
    { id: 'SINGLEMULTIFAMILY', label: '단독/다가구', isSelected: false },
    { id: 'COMMERCIAL', label: '상가주택', isSelected: false },
    { id: 'ROWHOUSE', label: '연립', isSelected: false },
    { id: 'COUNTRYHOUSE', label: '전원', isSelected: false }
  ]);
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
  }, [showToast]); // showToast를 의존성 배열에 추가

  const handleContractTypeToggle = (id: string) => {
    setContractTypes(prev =>
      prev.map(type => ({
        ...type,
        isSelected: type.id === id ? !type.isSelected : false
      }))
    );
  };

  const handlePropertyTypeToggle = (propertyType: PropertyType) => {
    setSelectedPropertyType(propertyType);
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

  const handleReset = () => {
    // 검색 조건 초기화
    setSearchParams({
      province: '',
      city: '',
      dong: ''
    });
    
    // 계약 유형 초기화
    setContractTypes(prev =>
      prev.map(type => ({
        ...type,
        isSelected: false
      }))
    );
    
    // 매물 유형 초기화
    setSelectedPropertyType(null);
    
    // 가격 범위 초기화
    setPriceRanges({
      sale: { min: '', max: '' },
      jeonse: { min: '', max: '' },
      deposit: { min: '', max: '' },
      monthly: { min: '', max: '' }
    });
    
    // 태그 선택 초기화
    setSelectedTags([]);

    // 태그 목록 접기
    setShowTags(false);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const selectedContractType = getSelectedContractType();
      
      const params: CrawlingPropertySearchParams = {
        propertyType: selectedPropertyType as CrawlingPropertyType || undefined,
        transactionType: selectedContractType as CrawlingTransactionType || undefined,
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

      const response = await searchCrawlingPropertiesWithTags(params);
      if (response.success && response.data) {
        setSearchResults(response.data.content);
        setPagination({
          ...response.data.pagination,
          currentPage: 1 // 검색 시 현재 페이지를 0으로 설정
        });
      } else {
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
      const selectedContractType = getSelectedContractType();
      
      const params: CrawlingPropertySearchParams = {
        propertyType: selectedPropertyType as CrawlingPropertyType || undefined,
        transactionType: selectedContractType as CrawlingTransactionType || undefined,
        province: searchParams.province || "서울시", // 초기 화면에서 로딩이 너무 길기 때문에 전체 조회를 피하기 위해 초기값 설정
        city: searchParams.city || "마포구",
        dong: searchParams.dong || undefined,
        page: page,
        size: pagination.size,
        tagIds: selectedTags.length > 0 ? selectedTags : [],
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
    } catch (e) {
      alert('상세 정보를 불러오지 못했습니다.');
    }
  };

  // 태그 토글 핸들러
  // 태그 버튼을 누를 경우 태그 id를 반환하는 함수
  // 함수 외부에서 태그 id 리스트를 생성
  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // type별로 태그를 그룹화하는 함수
  const groupTagsByType = (tags: CrawlingTagResDto[]) => {
    return tags.reduce((acc, tag) => {
      if (!acc[tag.type]) acc[tag.type] = [];
      acc[tag.type].push(tag);
      return acc;
    }, {} as Record<string, CrawlingTagResDto[]>);
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
              </div>
              <div className="space-y-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  매물 유형
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => handlePropertyTypeToggle(type.id as PropertyType)}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors
                          ${type.id === selectedPropertyType
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
                            placeholder="최소"
                          />
                          <span className="text-gray-500">~</span>
                          <input
                            type="text"
                            value={priceRanges.sale.max}
                            onChange={(e) => handlePriceRangeChange('sale', 'max', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="최대"
                          />
                          <span className="text-gray-500 w-20">만원</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSearch}
                          className="inline-flex items-center px-4 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
                        >
                          <Search size={16} className="mr-2" />
                          검색
                        </button>
                        {/* <button
                          onClick={handleReset}
                          className="inline-flex items-center px-4 h-10 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 whitespace-nowrap"
                        >
                          초기화
                        </button> */}
                      </div>
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
                            placeholder="최소"
                          />
                          <span className="text-gray-500">~</span>
                          <input
                            type="text"
                            value={priceRanges.jeonse.max}
                            onChange={(e) => handlePriceRangeChange('jeonse', 'max', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="최대"
                          />
                          <span className="text-gray-500 w-20">만원</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {/* <button
                          onClick={handleReset}
                          className="inline-flex items-center px-4 h-10 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 whitespace-nowrap"
                        >
                          초기화
                        </button> */}
                        <button
                          onClick={handleSearch}
                          className="inline-flex items-center px-4 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
                        >
                          <Search size={16} className="mr-2" />
                          검색
                        </button>
                      </div>
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
                            placeholder="최소"
                          />
                          <span className="text-gray-500">~</span>
                          <input
                            type="text"
                            value={priceRanges.deposit.max}
                            onChange={(e) => handlePriceRangeChange('deposit', 'max', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="최대"
                          />
                          <span className="text-gray-500 w-20">만원</span>
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
                            placeholder="최소"
                          />
                          <span className="text-gray-500">~</span>
                          <input
                            type="text"
                            value={priceRanges.monthly.max}
                            onChange={(e) => handlePriceRangeChange('monthly', 'max', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="최대"
                          />
                          <span className="text-gray-500 w-20">만원</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSearch}
                          className="inline-flex items-center px-4 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
                        >
                          <Search size={16} className="mr-2" />
                          검색
                        </button>
                        {/* <button
                          onClick={handleReset}
                          className="inline-flex items-center px-4 h-10 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 whitespace-nowrap"
                        >
                          초기화
                        </button> */}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <button
                    type="button"
                    onClick={() => setShowTags(prev => !prev)}
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
                          {tagList.map(tag => (
                            <button
                              key={tag.tagId}
                              type="button"
                              onClick={() => handleTagToggle(tag.tagId)}
                              className={`px-3 py-1 rounded-full border text-sm transition-colors
                                ${selectedTags.includes(tag.tagId)
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-black border-black'}`}
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
              <div className="p-6 text-center text-gray-500">
                검색 중...
              </div>
            ) : Array.isArray(searchResults) && searchResults.length > 0 ? (
              <div className="divide-y">
                {searchResults.map((property) => (
                  <div 
                    key={property.crawlingPropertiesId} 
                    className="p-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handlePropertyClick(property.crawlingPropertiesId)}
                  >
                    <div className="flex flex-row items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <span className="text-blue-600 font-semibold mr-2">
                            {property.transactionType === 'SALE' && '매매'}
                            {property.transactionType === 'JEONSE' && '전세'}
                            {property.transactionType === 'MONTHLY' && '월세'}
                            {property.transactionType === 'SALE' && (
                              <> {property.salePrice?.toLocaleString()}</>
                            )}
                            {property.transactionType === 'JEONSE' && (
                              <> {property.deposit?.toLocaleString()}</>
                            )}
                            {property.transactionType === 'MONTHLY' && (
                              <> {property.deposit?.toLocaleString()}/{property.monthlyRentFee?.toLocaleString()}</>
                            )}
                          </span>
                          {property.detailAddress}
                        </h3>
                        <p className="text-gray-600 font-semibold mr-2">
                          {propertyTypeKoreanMap[property.propertyType]} · {property.area}m² · {property.floor}/{property.allFloors}층 ·{' '}
                          {property.roomCnt}방 · {property.bathRoomCnt}욕실
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {property.tags && property.tags.map((tag) => (
                            <span 
                              key={tag.tagId}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                            >
                              {tag.value}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right flex items-center h-full">
                        <p className="text-lg font-medium text-black">
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
        {selectedProperty && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">상세 주소</h4>
              <p className="text-gray-600">{selectedProperty.detailAddress}</p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900">상세 정보</h4>
              <p className="text-gray-500">
                {propertyTypeKoreanMap[selectedProperty.propertyType]} · {selectedProperty.area}m² · {selectedProperty.floor}/{selectedProperty.allFloors}층 ·{' '}
                {selectedProperty.roomCnt}방 · {selectedProperty.bathRoomCnt}욕실
              </p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-2">태그 정보</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProperty.tags && selectedProperty.tags.map((tag) => (
                  <span 
                    key={tag.tagId}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                  >
                    {tag.value}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900">가격 정보</h4>
              <p className="text-gray-600">
                {selectedProperty.transactionType === 'SALE' && `매매가: ${selectedProperty.salePrice?.toLocaleString()}`}
                {selectedProperty.transactionType === 'JEONSE' && `전세가: ${selectedProperty.deposit?.toLocaleString()}`}
                {selectedProperty.transactionType === 'MONTHLY' && 
                  `보증금: ${selectedProperty.deposit?.toLocaleString()} / 월세: ${selectedProperty.monthlyRentFee?.toLocaleString()}`}
              </p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900">중개사무소 정보</h4>
              <p className="text-gray-600">{selectedProperty.realEstateOfficeName}</p>
              <p className="text-gray-600">{selectedProperty.realEstateOfficeAddress}</p>
              <p className="text-gray-600">{selectedProperty.realEstateAgentName}</p>
              <p className="text-gray-600">{selectedProperty.realEstateAgentContact}</p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}; 