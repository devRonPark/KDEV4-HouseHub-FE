import React from 'react';
import Modal from '../ui/Modal';
import { CrawlingPropertyItem } from '../../types/crawling-property';

interface CrawlingPropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: CrawlingPropertyItem | null;
}

const CrawlingPropertyDetailModal: React.FC<CrawlingPropertyDetailModalProps> = ({
  isOpen,
  onClose,
  property,
}) => {
  if (!property) return null;

  const propertyTypeKoreanMap = {
    MULTIFAMILY: '다세대',
    SINGLEMULTIFAMILY: '단독/다가구',
    VILLA: '빌라',
    COMMERCIAL: '상가주택',
    APARTMENT: '아파트',
    ROWHOUSE: '연립',
    OFFICETEL: '오피스텔',
    ONE_ROOM: '원룸',
    COUNTRYHOUSE: '전원',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="매물 상세 정보" size="lg">
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900">상세 주소</h4>
          <p className="text-gray-600">{property.detailAddress}</p>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900">상세 정보</h4>
          <p className="text-gray-500">
            {propertyTypeKoreanMap[property.propertyType]} · {property.area}m² · {property.floor}/
            {property.allFloors}층 · {property.roomCnt}방 · {property.bathRoomCnt}욕실
          </p>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900">가격 정보</h4>
          <p className="text-gray-600">
            {property.transactionType === 'SALE' ? (
              <>매매가: {property.salePrice?.toLocaleString()}만원</>
            ) : (
              <>
                보증금: {property.deposit?.toLocaleString()}만원
                {property.transactionType === 'MONTHLY' && (
                  <> · 월세: {property.monthlyRentFee?.toLocaleString()}만원</>
                )}
              </>
            )}
          </p>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900">중개사 정보</h4>
          <p className="text-gray-600">{property.realEstateOfficeName}</p>
          <p className="text-gray-500">
            {property.realEstateAgentName} · {property.realEstateAgentContact}
          </p>
        </div>
        {property.tags && property.tags.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-2">태그 정보</h4>
            <div className="flex flex-wrap gap-2">
              {property.tags.map((tag) => (
                <span
                  key={tag.tagId}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                >
                  {tag.value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CrawlingPropertyDetailModal;
