'use client';

import type React from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';

interface InquiryTypeSelectorProps {
  propertyType: string;
  transactionPurpose: string;
  onPropertyTypeChange: (value: string) => void;
  onTransactionPurposeChange: (value: string) => void;
  onTypeSelected: (type: string, purpose: string) => void;
  error?: string;
}

const InquiryTypeSelector: React.FC<InquiryTypeSelectorProps> = ({
  propertyType,
  transactionPurpose,
  onPropertyTypeChange,
  onTransactionPurposeChange,
  onTypeSelected,
  error,
}) => {
  const handlePropertyTypeChange = (event: SelectChangeEvent) => {
    const newType = event.target.value;
    onPropertyTypeChange(newType);

    // 둘 다 선택되었을 때 상위 컴포넌트에 알림
    if (newType && transactionPurpose) {
      onTypeSelected(newType, transactionPurpose);
    }
  };

  const handleTransactionPurposeChange = (event: SelectChangeEvent) => {
    const newPurpose = event.target.value;
    onTransactionPurposeChange(newPurpose);

    // 둘 다 선택되었을 때 상위 컴포넌트에 알림
    if (propertyType && newPurpose) {
      onTypeSelected(propertyType, newPurpose);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 매물 유형 선택 */}
        <FormControl fullWidth error={!!error} variant="outlined" size="small">
          <InputLabel id="property-type-label">매물 유형</InputLabel>
          <Select
            labelId="property-type-label"
            id="property-type"
            value={propertyType}
            onChange={handlePropertyTypeChange}
            label="매물 유형"
            className="bg-white"
          >
            <MenuItem value="">선택해주세요</MenuItem>
            <MenuItem value="아파트">아파트</MenuItem>
            <MenuItem value="오피스텔">오피스텔</MenuItem>
            <MenuItem value="상가">상가</MenuItem>
            <MenuItem value="사무실">사무실</MenuItem>
            <MenuItem value="원룸">원룸</MenuItem>
          </Select>
        </FormControl>

        {/* 거래 목적 선택 */}
        <FormControl fullWidth error={!!error} variant="outlined" size="small">
          <InputLabel id="transaction-purpose-label">거래 목적</InputLabel>
          <Select
            labelId="transaction-purpose-label"
            id="transaction-purpose"
            value={transactionPurpose}
            onChange={handleTransactionPurposeChange}
            label="거래 목적"
            className="bg-white"
          >
            <MenuItem value="">선택해주세요</MenuItem>
            <MenuItem value="매수">매수</MenuItem>
            <MenuItem value="매도">매도</MenuItem>
            <MenuItem value="임대">임대</MenuItem>
            <MenuItem value="임차">임차</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* 에러 메시지 */}
      {error && <FormHelperText className="text-red-500">{error}</FormHelperText>}

      {/* 미리보기 */}
      {propertyType && transactionPurpose && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-sm font-medium text-gray-700">유형 필드 미리보기:</p>
          <p className="text-sm font-bold text-blue-600 mt-1">{`${propertyType}_${transactionPurpose}`}</p>
        </div>
      )}
    </div>
  );
};

export default InquiryTypeSelector;
