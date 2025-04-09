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
import { useToast } from '../../context/useToast';
import { getProperties } from '../../api/property';
import type { PropertyType, FindPropertyResDto, PropertySearchFilter } from '../../types/property';
import { PaginationDto } from '../../types/pagination';

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

  // 검색 상태 및 필터 업데이트
  const [filter, setFilter] = useState<PropertySearchFilter>({
    province: '',
    city: '',
    dong: '',
    customerName: '',
    agentName: '',
    propertyType: null,
    page: 1,
    size: 10,
  });
  const [searchBtnClicked, setSearchBtnClicked] = useState(false);

  // 매물 목록 조회
  const fetchProperties = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getProperties(filter);
      console.log('Response in component:', response);

      if (response.success) {
        // 응답 데이터가 있는지 확인
        if (response.data) {
          console.log('Response data:', response.data);
          // content 배열이 있는지 확인
          const propertiesData = response.data.content || [];
          setProperties(propertiesData);
          setPagination(response.data.pagination);
        } else {
          // 데이터가 없는 경우 빈 배열로 설정
          setProperties([]);
          setPagination({
            totalPages: 1,
            totalElements: 0,
            size: 10,
            currentPage: 1,
          });
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
  }, [filter, showToast]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setFilter((prev) => ({ ...prev, page }));
    setSearchBtnClicked(true);
  };

  // 검색 핸들러 수정
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter((prev) => ({
      ...prev,
      province: filter.province,
      city: filter.city,
      dong: filter.dong,
      customerName: filter.customerName,
      agentName: filter.agentName,
      page: 1,
    }));
    setSearchBtnClicked(true);
  };

  // 필터 변경 핸들러
  const handlePropertyTypeChange = (type: PropertyType | null) => {
    setFilter((prev) => ({ ...prev, propertyType: type, page: 1 }));
    setSearchBtnClicked(true);
  };

  // 필터 초기화 함수 수정
  const resetFilters = () => {
    setFilter({
      province: '',
      city: '',
      dong: '',
      customerName: '',
      agentName: '',
      propertyType: null,
      page: 1,
      size: 10,
    });
    setSearchBtnClicked(false);
  };

  // 초기 데이터 로딩 및 필터/페이지 변경 시 데이터 다시 로딩
  // 최초 1회 로딩
  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (searchBtnClicked) {
      fetchProperties();
      setSearchBtnClicked(false); // 다시 false로 초기화
    }
  }, [fetchProperties, searchBtnClicked]);

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
              value={filter.province}
              onChange={(e) => setFilter({ ...filter, province: e.target.value })}
            />
            <Input
              placeholder="시/군/구"
              value={filter.city}
              onChange={(e) => setFilter({ ...filter, city: e.target.value })}
            />
            <Input
              placeholder="읍/면/동"
              value={filter.dong}
              onChange={(e) => setFilter({ ...filter, dong: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="고객 이름"
              value={filter.customerName}
              onChange={(e) => setFilter({ ...filter, customerName: e.target.value })}
              leftIcon={<Search size={18} />}
            />
            <Input
              placeholder="공인중개사 이름"
              value={filter.agentName}
              onChange={(e) => setFilter({ ...filter, agentName: e.target.value })}
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
            selectedType={filter.propertyType}
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
              {filter.province ||
              filter.city ||
              filter.dong ||
              filter.customerName ||
              filter.agentName ||
              filter.propertyType
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
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default PropertyList;
