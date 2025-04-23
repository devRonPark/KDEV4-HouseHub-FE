import { Home, Users, Phone } from 'react-feather';
import { CrawlingPropertyItem } from '../../types/crawling-property';
import Card from '../ui/Card';

interface CrawlingPropertyCardProps {
  property: CrawlingPropertyItem;
  onClick: () => void;
}

export const CrawlingPropertyCard = ({ property, onClick }: CrawlingPropertyCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{property.detailAddress}</h3>
            <div className="flex items-center space-x-4 text-gray-600">
              <span>{property.area.toFixed(2)}m²</span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {property.roomCnt}방 {property.bathRoomCnt}욕실
              </span>
            </div>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {property.salePrice.toLocaleString()}만원
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Home className="w-4 h-4 mr-2" />
          <span>{property.realEstateAgentName}</span>
          <span className="mx-2">·</span>
          <Phone className="w-4 h-4 mr-1" />
          <span>{property.realEstateAgentContact}</span>
        </div>
      </div>
    </Card>
  );
}; 