import { X } from 'react-feather';
import Modal from '../../components/ui/Modal';
import { CrawlingPropertyItem } from '../../types/crawling-property';

interface CrawlingPropertyModalProps {
  property: CrawlingPropertyItem;
  onClose: () => void;
}

const propertyTypeMap = {
  APARTMENT: '아파트',
  OFFICETEL: '오피스텔',
  VILLA: '빌라',
  ONEROOM: '원룸',
  TWOROOM: '투룸'
};

const transactionTypeMap = {
  SALE: '매매',
  JEONSE: '전세',
  MONTHLY: '월세'
};

const directionMap = {
  EAST: '동향',
  WEST: '서향',
  SOUTH: '남향',
  NORTH: '북향',
  SOUTH_EAST: '남동향',
  SOUTH_WEST: '남서향',
  NORTH_EAST: '북동향',
  NORTH_WEST: '북서향'
};

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div>
    <dt className="text-sm font-medium" style={{ color: '#000', fontFamily: 'Malgun Gothic, Arial, sans-serif', fontSize: '16px' }}>{label}</dt>
    <dd className="mt-1 text-sm" style={{ color: '#000', fontFamily: 'Malgun Gothic, Arial, sans-serif', fontSize: '16px' }}>{value}</dd>
  </div>
);

export const CrawlingPropertyModal = ({ property, onClose }: CrawlingPropertyModalProps) => {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="p-0">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ color: '#000', fontFamily: 'Malgun Gothic, Arial, sans-serif', fontSize: '20px' }}
            >
              매물 상세 정보
            </h2>
            <button
              onClick={onClose}
              className="hover:text-gray-500"
              style={{ color: '#000' }}
            >
              <X size={20} />
            </button>
          </div>

          <div>
            <div className="mb-4">
              <h3
                className="text-xl font-medium"
                style={{ color: '#000', fontFamily: 'Malgun Gothic, Arial, sans-serif', fontSize: '18px' }}
              >
                {property.detailAddress}
              </h3>
              <p
                className="mt-1 text-sm"
                style={{ color: '#000', fontFamily: 'Malgun Gothic, Arial, sans-serif', fontSize: '15px' }}
              >
                {property.province} {property.city} {property.dong}
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="매물 종류" value={propertyTypeMap[property.propertyType]} />
                <InfoItem label="거래 종류" value={transactionTypeMap[property.transactionType]} />
                <InfoItem label="전용면적" value={`${property.area.toFixed(2)}m²`} />
                <InfoItem label="층수" value={`${property.floor}층 / ${property.allFloors}층`} />
                <InfoItem label="방향" value={directionMap[property.direction]} />
                <InfoItem label="구조" value={`${property.roomCnt}방 ${property.bathRoomCnt}욕실`} />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4
                  className="text-lg font-medium mb-3"
                  style={{ color: '#000', fontFamily: 'Malgun Gothic, Arial, sans-serif', fontSize: '17px' }}
                >
                  가격 정보
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {property.transactionType === 'SALE' && (
                    <InfoItem label="매매가" value={`${property.salePrice.toLocaleString()}만원`} />
                  )}
                  {property.transactionType === 'JEONSE' && (
                    <InfoItem label="전세가" value={`${property.deposit?.toLocaleString()}만원`} />
                  )}
                  {property.transactionType === 'MONTHLY' && (
                    <>
                      <InfoItem label="보증금" value={`${property.deposit?.toLocaleString()}만원`} />
                      <InfoItem label="월세" value={`${property.monthlyRentFee?.toLocaleString()}만원`} />
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4
                  className="text-lg font-medium mb-3"
                  style={{ color: '#000', fontFamily: 'Malgun Gothic, Arial, sans-serif', fontSize: '17px' }}
                >
                  부동산 정보
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="부동산" value={property.realEstateOfficeName} />
                  <InfoItem label="중개사" value={property.realEstateAgentName} />
                  <InfoItem label="연락처" value={property.realEstateAgentContact} />
                  {property.realEstateOfficeAddress && (
                    <InfoItem label="주소" value={property.realEstateOfficeAddress} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}; 