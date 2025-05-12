import { useEffect, useState } from 'react';
import { RegionItem } from '../../types/region';
import apiClient from '../../api/client';
import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { ChevronRight, MapPin } from 'react-feather';

export interface ThreeLevelSelectProps {
  onRegionSelect?: (selection: {
    doCode?: string;
    doName?: string;
    sigunguCode?: string;
    sigunguName?: string;
    dongCode?: string;
    dongName?: string;
  }) => void;
  className?: string;
  initialDoCode?: string;
  initialSigunguCode?: string;
  initialDongCode?: string;
}

export interface RegionSelectState {
  list: RegionItem[];
  selected?: {
    code?: string;
    name: string;
  };
  isLoading: boolean;
  error: string | null;
}

// 지역 타입을 나타내는 상수들
export const REGION_DO = 'do';
export const REGION_SIGUNGU = 'sigungu';
export const REGION_DONG = 'dong';

export default function ThreeLevelSelect({
  onRegionSelect,
  initialDoCode,
  initialSigunguCode,
  initialDongCode,
}: ThreeLevelSelectProps) {
  const [regionState, setRegionState] = useState<Record<string, RegionSelectState>>({
    do: {
      list: [],
      isLoading: false,
      error: null,
    },
    sigungu: {
      list: [],
      isLoading: false,
      error: null,
    },
    dong: {
      list: [],
      isLoading: false,
      error: null,
    },
  });
  const [selectedRegion, setSelectedRegion] = useState<Record<string, RegionItem>>({
    do: { code: initialDoCode || '', name: '' },
    sigungu: { code: initialSigunguCode || '', name: '' },
    dong: { code: initialDongCode || '', name: '' },
  });

  // 도/광역시 목록 불러오기
  useEffect(() => {
    const fetchDoList = async () => {
      setRegionState((prevState) => ({
        ...prevState,
        do: { ...prevState[REGION_DO], isLoading: true, error: null },
      }));

      try {
        const response = await apiClient.get('/regions/dos');
        if (!response.data.success) {
          throw new Error('도/광역시 데이터를 불러올 수 없습니다.');
        }

        const data = response.data;
        setRegionState((prevState) => ({
          ...prevState,
          do: { ...prevState[REGION_DO], list: data.data },
        }));

        // 초기값이 있는 경우 시/군/구 데이터도 불러오기
        if (initialDoCode) {
          const doItem = data.data.find((item: RegionItem) => item.code === initialDoCode);
          if (doItem) {
            setSelectedRegion((prevState) => ({
              ...prevState,
              do: { code: doItem.code, name: doItem.name },
            }));
            fetchSigunguList(initialDoCode);
          }
        }
      } catch {
        setRegionState((prevState) => ({
          ...prevState,
          do: { ...prevState[REGION_DO], error: '도/광역시 데이터를 불러올 수 없습니다.' },
        }));
      } finally {
        setRegionState((prevState) => ({
          ...prevState,
          do: { ...prevState[REGION_DO], isLoading: false },
        }));
      }
    };

    fetchDoList();
  }, [initialDoCode]);

  useEffect(() => {
    if (!initialDoCode && !initialSigunguCode && !initialDongCode) {
      setSelectedRegion({
        do: { code: '', name: '' },
        sigungu: { code: '', name: '' },
        dong: { code: '', name: '' },
      });
    }
  }, [initialDoCode, initialSigunguCode, initialDongCode]);

  // 시/군/구 목록 불러오기
  const fetchSigunguList = async (doCode: string) => {
    setRegionState((prevState) => ({
      ...prevState,
      sigungu: { ...prevState[REGION_SIGUNGU], isLoading: true, error: null },
    }));

    try {
      const response = await apiClient.get(`/regions/sigungus?doCode=${doCode}`);

      const data = response.data;
      setRegionState((prevState) => ({
        ...prevState,
        sigungu: { ...prevState[REGION_SIGUNGU], list: data.data },
      }));

      // 초기값이 있는 경우 읍/면/동 데이터도 불러오기
      if (initialSigunguCode) {
        const sigunguItem = data.data.find((item: RegionItem) => item.code === initialSigunguCode);
        if (sigunguItem) {
          setSelectedRegion((prevState) => ({
            ...prevState,
            sigungu: { code: sigunguItem.code, name: sigunguItem.name },
          }));

          fetchDongList(initialSigunguCode);
        }
      }
    } catch {
      setRegionState((prevState) => ({
        ...prevState,
        sigungu: {
          ...prevState[REGION_SIGUNGU],
          error: '시/군/구 데이터를 불러올 수 없습니다.',
        },
      }));
    } finally {
      setRegionState((prevState) => ({
        ...prevState,
        sigungu: { ...prevState[REGION_SIGUNGU], isLoading: false },
      }));
    }
  };

  // 읍/면/동 목록 불러오기
  const fetchDongList = async (sigunguCode: string) => {
    setRegionState((prevState) => ({
      ...prevState,
      dong: { ...prevState[REGION_DONG], isLoading: true, error: null },
    }));

    try {
      const response = await apiClient.get(`/regions/dongs?sigunguCode=${sigunguCode}`);

      const data = response.data;
      setRegionState((prevState) => ({
        ...prevState,
        dong: { ...prevState[REGION_DONG], list: data.data },
      }));

      // 초기값이 있는 경우 선택
      if (initialDongCode) {
        const dongItem = data.data.find((item: RegionItem) => item.code === initialDongCode);
        if (dongItem) {
          setRegionState((prevState) => ({
            ...prevState,
            dong: {
              ...prevState[REGION_DONG],
              selected: { code: dongItem.code, name: dongItem.name },
            },
          }));
          setSelectedRegion((prevState) => ({
            ...prevState,
            dong: { code: dongItem.code, name: dongItem.name },
          }));
        }
      }
    } catch {
      setRegionState((prevState) => ({
        ...prevState,
        dong: { ...prevState[REGION_DONG], error: '읍/면/동 데이터를 불러올 수 없습니다.' },
      }));
    } finally {
      setRegionState((prevState) => ({
        ...prevState,
        dong: { ...prevState[REGION_DONG], isLoading: false },
      }));
    }
  };

  // 도/광역시 선택 핸들러
  const handleDoChange = (event: SelectChangeEvent<string>) => {
    const doCode = event.target.value;
    const doItem = regionState[REGION_DO].list.find((item) => item.code === doCode);

    setRegionState((prevState) => ({
      ...prevState,
      sigungu: { ...prevState[REGION_SIGUNGU], list: [], selected: undefined },
      dong: { ...prevState[REGION_DONG], list: [], selected: undefined },
    }));
    setSelectedRegion((prevState) => ({
      ...prevState,
      do: { code: doCode, name: doItem?.name || '' },
    }));

    if (doCode) {
      fetchSigunguList(doCode);
    }

    onRegionSelect?.({
      doCode,
      doName: doItem?.name,
    });
  };

  // 시/군/구 선택 핸들러
  const handleSigunguChange = (event: SelectChangeEvent<string>) => {
    const sigunguCode = event.target.value;
    const sigunguItem = regionState[REGION_SIGUNGU].list.find((item) => item.code === sigunguCode);

    setSelectedRegion((prevState) => ({
      ...prevState,
      sigungu: { code: sigunguCode, name: sigunguItem?.name || '' },
    }));
    setRegionState((prevState) => ({
      ...prevState,
      dong: { ...prevState[REGION_DONG], list: [], selected: undefined },
    }));

    if (sigunguCode) {
      fetchDongList(sigunguCode);
    }

    onRegionSelect?.({
      doCode: selectedRegion[REGION_DO]?.code,
      doName: selectedRegion[REGION_DO]?.name,
      sigunguCode,
      sigunguName: sigunguItem?.name,
    });
  };

  // 읍/면/동 선택 핸들러
  const handleDongChange = (event: SelectChangeEvent<string>) => {
    const dongCode = event.target.value;
    const dongItem = regionState[REGION_DONG].list.find((item) => item.code === dongCode);

    setSelectedRegion((prevState) => ({
      ...prevState,
      dong: { code: dongCode, name: dongItem?.name || '' },
    }));

    onRegionSelect?.({
      doCode: selectedRegion[REGION_DO]?.code,
      doName: selectedRegion[REGION_DO]?.name,
      sigunguCode: selectedRegion[REGION_SIGUNGU]?.code,
      sigunguName: selectedRegion[REGION_SIGUNGU]?.name,
      dongCode,
      dongName: dongItem?.name,
    });
  };

  // 모바일 화면에서 사용할 브레드크럼 컴포넌트
  const Breadcrumb = () => (
    <div className="flex items-center text-sm text-gray-600 mb-4 md:hidden">
      <span className="font-medium">시/도</span>
      <ChevronRight size={16} className="mx-1" />
      <span className="font-medium">시/군/구</span>
      <ChevronRight size={16} className="mx-1" />
      <span className="font-medium">읍/면/동</span>
    </div>
  );

  // 선택된 지역 표시 컴포넌트
  const SelectedRegion = () => {
    if (!selectedRegion[REGION_DO]) return null;

    return (
      <div className="flex items-center text-sm text-gray-700 mt-4 bg-gray-50 p-2 rounded-md">
        <MapPin size={16} className="mr-2 text-gray-500" />
        <span>
          {selectedRegion[REGION_DO]?.name !== '' ? selectedRegion[REGION_DO]?.name : '도/광역시'}
        </span>
        {selectedRegion[REGION_SIGUNGU] && (
          <>
            <ChevronRight size={14} className="mx-1 text-gray-400" />
            <span>
              {selectedRegion[REGION_SIGUNGU]?.name !== ''
                ? selectedRegion[REGION_SIGUNGU]?.name
                : '시/군/구'}
            </span>
          </>
        )}
        {selectedRegion[REGION_DONG] && (
          <>
            <ChevronRight size={14} className="mx-1 text-gray-400" />
            <span>
              {selectedRegion[REGION_DONG]?.name !== ''
                ? selectedRegion[REGION_DONG]?.name
                : '읍/면/동'}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 max-w-screen-lg">
      <SelectedRegion />
      <Breadcrumb />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 도/광역시 선택 */}
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel id="do-select-label">도/광역시 선택</InputLabel>
          <Select
            labelId="do-select-label"
            id="do-select"
            value={selectedRegion[REGION_DO]?.code || ''}
            onChange={handleDoChange}
            label="도/광역시 선택"
            disabled={regionState[REGION_DO].isLoading}
            error={!!regionState[REGION_DO].error}
            className="bg-white"
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
            }}
          >
            <MenuItem value="">
              <em>선택하세요</em>
            </MenuItem>
            {regionState[REGION_DO].list.map((doItem) => (
              <MenuItem key={doItem.code} value={doItem.code}>
                {doItem.name}
              </MenuItem>
            ))}
          </Select>
          {regionState[REGION_DO].isLoading && (
            <div className="absolute right-8 top-2">
              <CircularProgress size={20} />
            </div>
          )}
          {regionState[REGION_DO].error && (
            <p className="text-red-500 text-xs mt-1">{regionState[REGION_DO].error}</p>
          )}
        </FormControl>

        {/* 시/군/구 선택 */}
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel id="sigungu-select-label">시/군/구 선택</InputLabel>
          <Select
            labelId="sigungu-select-label"
            id="sigungu-select"
            value={selectedRegion[REGION_SIGUNGU]?.code || ''}
            onChange={handleSigunguChange}
            label="시/군/구 선택"
            disabled={!selectedRegion[REGION_SIGUNGU] || regionState[REGION_SIGUNGU].isLoading}
            error={!!regionState[REGION_SIGUNGU].error}
            className="bg-white"
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
            }}
          >
            <MenuItem value="">
              <em>선택하세요</em>
            </MenuItem>
            {regionState[REGION_SIGUNGU].list.map((sigunguItem) => (
              <MenuItem key={sigunguItem.code} value={sigunguItem.code}>
                {sigunguItem.name}
              </MenuItem>
            ))}
          </Select>
          {regionState[REGION_SIGUNGU].isLoading && (
            <div className="absolute right-8 top-2">
              <CircularProgress size={20} />
            </div>
          )}
          {regionState[REGION_SIGUNGU].error && (
            <p className="text-red-500 text-xs mt-1">{regionState[REGION_SIGUNGU].error}</p>
          )}
        </FormControl>

        {/* 읍/면/동 선택 */}
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel id="dong-select-label">읍/면/동 선택</InputLabel>
          <Select
            labelId="dong-select-label"
            id="dong-select"
            value={selectedRegion[REGION_DONG]?.code || ''}
            onChange={handleDongChange}
            label="읍/면/동 선택"
            disabled={!selectedRegion[REGION_DONG] || regionState[REGION_DONG].isLoading}
            error={!!regionState[REGION_DONG].error}
            className="bg-white"
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
            }}
          >
            <MenuItem value="">
              <em>선택하세요</em>
            </MenuItem>
            {regionState[REGION_DONG].list.map((dongItem) => (
              <MenuItem key={dongItem.code} value={dongItem.code}>
                {dongItem.name}
              </MenuItem>
            ))}
          </Select>
          {regionState[REGION_DONG].isLoading && (
            <div className="absolute right-8 top-2">
              <CircularProgress size={20} />
            </div>
          )}
          {regionState[REGION_DONG].error && (
            <p className="text-red-500 text-xs mt-1">{regionState[REGION_DONG].error}</p>
          )}
        </FormControl>
      </div>
    </div>
  );
}
