import { CrawlingPropertyResDto, CrawlingPropertyType } from '../../types/crawling-property';

const formatTransactionInfo = (property: CrawlingPropertyResDto) => {
  const { transactionType, salePrice, deposit, monthlyRentFee } = property;
  if (transactionType === 'SALE') return `매매가: ${salePrice?.toLocaleString()}`;
  if (transactionType === 'JEONSE') return `전세가: ${deposit?.toLocaleString()}`;
  if (transactionType === 'MONTHLY') {
    return `보증금: ${deposit?.toLocaleString()} / 월세: ${monthlyRentFee?.toLocaleString()}`;
  }
  return '';
};

const propertyTypeKoreanMap: Record<CrawlingPropertyType, string> = {
  'APARTMENT': '아파트',
  'OFFICETEL': '오피스텔',
  'VILLA': '빌라',
  'ONE_ROOM': '원룸',
  'MULTIFAMILY': '다세대',
  'SINGLEMULTIFAMILY': '단독/다가구',
  'COMMERCIAL': '상가주택',
  'ROWHOUSE': '연립',
  'COUNTRYHOUSE': '전원',
};

type PropertyDetailContentProps = {
  property: CrawlingPropertyResDto;
};

const PropertyDetailContent = ({ property }: PropertyDetailContentProps) => (
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
      <h4 className="font-medium text-gray-900 mb-2">태그 정보</h4>
      <div className="flex flex-wrap gap-2">
        {property.tags?.map((tag) => (
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
      <p className="text-gray-600">{formatTransactionInfo(property)}</p>
    </div>
    <div className="border-t border-gray-200 pt-4">
      <h4 className="font-medium text-gray-900">중개사무소 정보</h4>
      <p className="text-gray-600">{property.realEstateOfficeName}</p>
      <p className="text-gray-600">{property.realEstateOfficeAddress}</p>
      <p className="text-gray-600">{property.realEstateAgentName}</p>
      <p className="text-gray-600">{property.realEstateAgentContact}</p>
    </div>
  </div>
);

export default PropertyDetailContent;
