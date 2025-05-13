import { CrawlingPropertyResDto, CrawlingPropertyType } from '../../types/crawling-property';
// import { PropertyType } from '../../types/property';

const formatPriceLabel = (property: CrawlingPropertyResDto) => {
  const { transactionType, salePrice, deposit, monthlyRentFee } = property;
  if (transactionType === 'SALE') return `매매 ${salePrice?.toLocaleString()}`;
  if (transactionType === 'JEONSE') return `전세 ${deposit?.toLocaleString()}`;
  if (transactionType === 'MONTHLY')
    return `월세 ${deposit?.toLocaleString()}/${monthlyRentFee?.toLocaleString()}`;
  return '';
};

const formatSummary = (
  property: CrawlingPropertyResDto,
  propertyTypeKoreanMap: Record<CrawlingPropertyType, string>
) => {
  return `${propertyTypeKoreanMap[property.propertyType]} · ${property.area}m² · ${property.floor}/${property.allFloors}층 · ${property.roomCnt}방 · ${property.bathRoomCnt}욕실`;
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

type PropertyCardProps = {
  property: CrawlingPropertyResDto;
  onClick: (id: string) => void;
};

const PropertyCard = ({ property, onClick }: PropertyCardProps) => (
  <div
    key={property.crawlingPropertiesId}
    className="p-6 hover:bg-gray-50 cursor-pointer"
    onClick={() => onClick(property.crawlingPropertiesId)}
  >
    <div className="flex flex-row items-center justify-between">
      <div>
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <span className="text-blue-600 font-semibold mr-2">{formatPriceLabel(property)}</span>
          {property.detailAddress}
        </h3>
        <p className="text-gray-600 font-semibold mr-2">
          {formatSummary(property, propertyTypeKoreanMap)}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {property.tags?.map((tag) => (
            <span
              key={tag.tagId}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
            >
              {tag.value}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right flex items-center h-full">
        <p className="text-lg font-medium text-black">{property.realEstateOfficeName}</p>
      </div>
    </div>
  </div>
);

export default PropertyCard;
