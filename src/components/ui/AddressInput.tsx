import React, { useState } from 'react';

declare global {
  interface Window {
    daum: any;
  }
}
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useToast from '../../hooks/useToast';

interface AddressProps {
  onAddressSelect: (address: {
    jibunAddress: string;
    roadAddress: string;
    detailAddress: string;
    zipCode: string;
  }) => void;
}

const AddressInput: React.FC<AddressProps> = ({ onAddressSelect }) => {
  const { showToast } = useToast();
  const [jibunAddress, setJibunAddress] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleAddressSearch = () => {
    try {
      new window.daum.Postcode({
        oncomplete: (data: { jibunAddress: string; roadAddress: string; zonecode: string }) => {
          const jibunAddr = data.jibunAddress;
          const roadAddr = data.roadAddress;
          const zip = data.zonecode;

          setJibunAddress(jibunAddr);
          setRoadAddress(roadAddr);
          setZipCode(zip);

          onAddressSelect({
            jibunAddress: jibunAddr,
            roadAddress: roadAddr,
            detailAddress,
            zipCode: zip,
          });
        },
      }).open();
    } catch (error) {
      console.error('주소 검색 오류:', error);
      // 사용자에게 오류 메시지 표시
      showToast('주소 검색에 실패했습니다.', 'error');
    }
  };

  const handleDetailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setDetailAddress(value);

    // 부모 컴포넌트로 상세 주소 업데이트
    onAddressSelect({ jibunAddress, roadAddress, detailAddress: value, zipCode });
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 items-end">
        <Input label="주소" value={roadAddress} placeholder="주소 검색" readOnly />
        <Button
          type="button"
          className="w-[110px] h-[42px]"
          variant="outline"
          onClick={handleAddressSearch}
        >
          주소 검색
        </Button>
      </div>
      <Input
        label="상세주소"
        value={detailAddress}
        onChange={handleDetailAddressChange}
        placeholder="상세주소"
      />
    </div>
  );
};

export default AddressInput;
