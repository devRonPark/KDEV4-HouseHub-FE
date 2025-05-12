import React from 'react';
import Modal from '../ui/Modal';
import type { CrawlingPropertyResDto } from '../../types/crawling-property';
import { PropertyTypeLabels } from '../../types/property';

interface CrawlingPropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: CrawlingPropertyResDto | null;
}

const CrawlingPropertyDetailModal: React.FC<CrawlingPropertyDetailModalProps> = ({
  isOpen,
  onClose,
  property,
}) => {
  if (!property) return null;

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
            {PropertyTypeLabels[property.propertyType]} · {property.area}m² · 매물층{' '}
            {property.floor}층 / 전체 {property.allFloors}층 · {property.roomCnt}방 ·{' '}
            {property.bathRoomCnt}욕실
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
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900">종류</h4>
          <p className="text-sm text-gray-600">{PropertyTypeLabels[property.propertyType]}</p>
        </div>
      </div>
    </Modal>
  );
};

export default CrawlingPropertyDetailModal;
