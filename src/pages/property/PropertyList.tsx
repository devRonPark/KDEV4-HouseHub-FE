'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, RefreshCw, Home } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import PropertyListItem from '../../components/property/PropertyListItem';
import PropertyTypeFilter from '../../components/property/PropertyTypeFilter';
import { useToast } from '../../context/ToastContext';
import { getProperties } from '../../api/property';
import type { PropertyType, FindPropertyResDto, PropertySearchFilter } from '../../types/property';

const PropertyList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<FindPropertyResDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | null>(null);

  // 검색 상태 및 필터 업데이트
  const [searchParams, setSearchParams] = useState<{
    province: string;
    city: string;
    dong: string;
    customerName: string;
    agentName: string;
  }>({
    province: '',
    city: '',
    dong: '',
    customerName: '',
    agentName: '',
  });

  // 임시 검색어 상태 추가
  const [tempSearchParams, setTempSearchParams] = useState({
    province: '',
    city: '',
    dong: '',
    customerName: '',
    agentName: '',
  });

  // 매물 목록 조회
  const fetchProperties = useCallback(async () => {
    setIsLoading(true);

    const filter: PropertySearchFilter = {
      page: currentPage - 1, // API는 0부터 시작하는 페이지 인덱스 사용
      size: 10,
      province: searchParams.province || undefined,
      city: searchParams.city || undefined,
      dong: searchParams.dong || undefined,
      propertyType: selectedPropertyType || undefined,
      customerName: searchParams.customerName || undefined,
      agentName: searchParams.agentName || undefined,
    };

    try {
      const response = await getProperties(filter);
      console.log('Response in component:', response);

      if (response.success) {
        // 응답 데이터가 있는지 확인
        if (response.data) {
          // properties 배열이 있는지 확인
          const propertiesData = response.data.properties || [];
          setProperties(propertiesData);

          // 페이지네이션 정보 설정
          setTotalPages(response.data.totalPages || 1);
        } else {
          // 데이터가 없는 경우 빈 배열로 설정
          setProperties([]);
          setTotalPages(1);
          console.warn('No data in response:', response);
        }
      } else {
        showToast(response.error || '매물 목록을 불러오는데 실패했습니다.', 'error');
        // 오류 시 빈 배열로 설정
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      showToast('매물 목록을 불러오는 중 오류가 발생했습니다.', 'error');
      // 예외 발생 시 빈 배열로 설정
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchParams, selectedPropertyType, showToast]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 검색 핸들러 수정
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(tempSearchParams);
    setCurrentPage(1); // 검��� 시 첫 페이지로 이동
  };

  // 필터 변경 핸들러
  const handlePropertyTypeChange = (type: PropertyType | null) => {
    setSelectedPropertyType(type);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  // 필터 초기화 함수 수정
  const resetFilters = () => {
    setTempSearchParams({
      province: '',
      city: '',
      dong: '',
      customerName: '',
      agentName: '',
    });
    setSearchParams({
      province: '',
      city: '',
      dong: '',
      customerName: '',
      agentName: '',
    });
    setSelectedPropertyType(null);
    setCurrentPage(1);
  };

  // 초기 데이터 로딩 및 필터/페이지 변경 시 데이터 다시 로딩
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

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

      {/* 검색 및 필터 */}
      <div className="mt-6 bg-white shadow rounded-lg p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="도/특별시/광역시"
              value={tempSearchParams.province}
              onChange={(e) =>
                setTempSearchParams({ ...tempSearchParams, province: e.target.value })
              }
            />
            <Input
              placeholder="시/군/구"
              value={tempSearchParams.city}
              onChange={(e) => setTempSearchParams({ ...tempSearchParams, city: e.target.value })}
            />
            <Input
              placeholder="읍/면/동"
              value={tempSearchParams.dong}
              onChange={(e) => setTempSearchParams({ ...tempSearchParams, dong: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="고객 이름"
              value={tempSearchParams.customerName}
              onChange={(e) =>
                setTempSearchParams({ ...tempSearchParams, customerName: e.target.value })
              }
              leftIcon={<Search size={18} />}
            />
            <Input
              placeholder="공인중개사 이름"
              value={tempSearchParams.agentName}
              onChange={(e) =>
                setTempSearchParams({ ...tempSearchParams, agentName: e.target.value })
              }
              leftIcon={<Search size={18} />}
            />
          </div>

          <div className="flex justify-between">
            <Button type="submit" variant="primary">
              검색
            </Button>
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

        <div className="mt-4">
          <PropertyTypeFilter
            selectedType={selectedPropertyType}
            onChange={handlePropertyTypeChange}
          />
        </div>
      </div>

      {/* 매물 목록 */}
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
        ) : properties && properties.length > 0 ? (
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
              {searchParams.province ||
              searchParams.city ||
              searchParams.dong ||
              searchParams.customerName ||
              searchParams.agentName ||
              selectedPropertyType
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

      {/* 페이지네이션 - properties가 undefined일 경우 대비 */}
      {!isLoading && properties && properties.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default PropertyList;
