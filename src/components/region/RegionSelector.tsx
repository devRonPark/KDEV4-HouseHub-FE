'use client';

import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { MapPin } from 'react-feather';
import Select from '../ui/Select';
import type { RegionItem, RegionData } from '../../types/region';
import { fetchProvinces, fetchCities, fetchDongs } from '../../api/region';

interface RegionDropdownProps {
  onChange?: (regionData: RegionData | null) => void;
  initialValue?: RegionData | null;
  error?: string;
}

const RegionDropdown: FC<RegionDropdownProps> = ({ onChange = () => {}, initialValue, error }) => {
  // 각 드롭다운의 데이터 상태
  const [provinces, setProvinces] = useState<RegionItem[]>([]);
  const [cities, setCities] = useState<RegionItem[]>([]);
  const [dongs, setDongs] = useState<RegionItem[]>([]);

  // 선택된 값 상태
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedCityCode, setSelectedCityCode] = useState<string>('');
  const [selectedDongCode, setSelectedDongCode] = useState<string>('');

  // 선택된 이름 상태 (최종 결과에 사용)
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('');
  const [selectedCityName, setSelectedCityName] = useState<string>('');
  const [selectedDongName, setSelectedDongName] = useState<string>('');

  // 로딩 상태
  const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [loadingDongs, setLoadingDongs] = useState<boolean>(false);

  // 에러 상태
  const [apiError, setApiError] = useState<string | null>(null);

  // 초기값 설정
  useEffect(() => {
    if (initialValue) {
      // 초기값이 있는 경우, API를 호출하여 해당 코드 값을 찾아야 함
      // 이 예제에서는 초기값 설정을 위한 로직은 생략
      // 실제 구현 시에는 이름으로 코드를 조회하는 API가 필요할 수 있음
    }
  }, [initialValue]);

  // 도/특별시/광역시 목록 로드
  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingProvinces(true);
      setApiError(null);
      try {
        const data = await fetchProvinces();
        setProvinces(data.data as RegionItem[]);
      } catch (error) {
        console.error('도/특별시/광역시 목록 조회 실패:', error);
        setApiError('도/특별시/광역시 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  // 시/군/구 목록 로드
  useEffect(() => {
    if (selectedProvinceCode === '') {
      setCities([]);
      return;
    }

    const loadCities = async () => {
      setLoadingCities(true);
      setApiError(null);
      try {
        const data = await fetchCities(selectedProvinceName);
        setCities(data.data as RegionItem[]);
      } catch (error) {
        console.error(`시/군/구 목록 조회 실패:`, error);
        setApiError('시/군/구 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, [selectedProvinceCode, selectedProvinceName]);

  // 읍/면/동 목록 로드
  useEffect(() => {
    if (selectedProvinceCode === '' || selectedCityCode === '') {
      setDongs([]);
      return;
    }

    const loadDongs = async () => {
      setLoadingDongs(true);
      setApiError(null);
      try {
        const data = await fetchDongs(selectedProvinceName, selectedCityName);
        setDongs(data.data as RegionItem[]);
      } catch (error) {
        console.error(`읍/면/동 목록 조회 실패:`, error);
        setApiError('읍/면/동 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoadingDongs(false);
      }
    };

    loadDongs();
  }, [selectedProvinceCode, selectedCityCode, selectedProvinceName, selectedCityName]);

  // 선택된 값이 변경될 때마다 상위 컴포넌트에 알림
  useEffect(() => {
    if (selectedProvinceName && selectedCityName && selectedDongName) {
      const regionData: RegionData = {
        province: selectedProvinceName,
        city: selectedCityName,
        dong: selectedDongName,
        name: `${selectedProvinceName} ${selectedCityName} ${selectedDongName}`,
      };
      onChange(regionData);
    } else {
      onChange(null);
    }
  }, [selectedProvinceName, selectedCityName, selectedDongName, onChange]);

  // 도/특별시/광역시 선택 핸들러
  const handleProvinceChange = (value: string) => {
    setSelectedProvinceCode(value);

    // 선택된 province의 name 찾기
    const selectedProvince = provinces.find((province) => province.code.toString() === value);
    setSelectedProvinceName(selectedProvince?.name || '');

    // 하위 선택 초기화
    setSelectedCityCode('');
    setSelectedCityName('');
    setSelectedDongCode('');
    setSelectedDongName('');
  };

  // 시/군/구 선택 핸들러
  const handleCityChange = (value: string) => {
    setSelectedCityCode(value);

    // 선택된 city의 name 찾기
    const selectedCity = cities.find((city) => city.code.toString() === value);
    setSelectedCityName(selectedCity?.name || '');

    // 하위 선택 초기화
    setSelectedDongCode('');
    setSelectedDongName('');
  };

  // 읍/면/동 선택 핸들러
  const handleDongChange = (value: string) => {
    setSelectedDongCode(value);

    // 선택된 dong의 name 찾기
    const selectedDong = dongs.find((dong) => dong.code.toString() === value);
    setSelectedDongName(selectedDong?.name || '');
  };

  // 에러 메시지 (props 또는 API에서 발생한 에러)
  const errorMessage = error;

  // Select 컴포넌트에 전달할 옵션 변환
  const provinceOptions = [
    { value: '', label: '선택해주세요' },
    ...provinces.map((province) => ({
      value: province.code.toString(),
      label: province.name,
    })),
  ];

  const cityOptions = [
    { value: '', label: '선택해주세요' },
    ...cities.map((city) => ({
      value: city.code.toString(),
      label: city.name,
    })),
  ];

  const dongOptions = [
    { value: '', label: '선택해주세요' },
    ...dongs.map((dong) => ({
      value: dong.code.toString(),
      label: dong.name,
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <MapPin className="mr-2 text-blue-500" size={18} />
        <h3 className="text-sm font-medium text-gray-700">지역 선택</h3>
      </div>

      {/* 도/특별시/광역시 선택 */}
      <Select
        label="도/특별시/광역시"
        options={provinceOptions}
        value={selectedProvinceCode}
        onChange={handleProvinceChange}
        disabled={loadingProvinces}
        error={errorMessage}
        className="bg-white"
      />

      {/* 시/군/구 선택 */}
      <Select
        label="시/군/구"
        options={cityOptions}
        value={selectedCityCode}
        onChange={handleCityChange}
        disabled={selectedProvinceCode === '' || loadingCities}
        error={errorMessage}
        className="bg-white"
      />

      {/* 읍/면/동 선택 */}
      <Select
        label="읍/면/동"
        options={dongOptions}
        value={selectedDongCode}
        onChange={handleDongChange}
        disabled={selectedCityCode === '' || loadingDongs}
        error={errorMessage}
        className="bg-white"
      />

      {/* 로딩 인디케이터 */}
      {(loadingProvinces || loadingCities || loadingDongs) && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* 선택된 지역 표시 */}
      {selectedProvinceName && selectedCityName && selectedDongName && (
        <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-sm font-medium text-blue-800">선택된 지역:</p>
          <p className="text-sm text-blue-700 mt-1">
            {selectedProvinceName} {selectedCityName} {selectedDongName}
          </p>
        </div>
      )}
    </div>
  );
};

export default RegionDropdown;
