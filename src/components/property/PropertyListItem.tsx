import type React from 'react';
import { Home } from 'react-feather';
import { Link } from 'react-router-dom';
import {
  type FindPropertyResDto,
  PropertyTypeLabels,
  PropertyTypeColors,
} from '../../types/property';

interface PropertyListItemProps {
  property: FindPropertyResDto;
}

const PropertyListItem: React.FC<PropertyListItemProps> = ({ property }) => {
  return (
    <Link
      to={`/properties/${property.id}`}
      className="block border rounded-lg hover:shadow-md transition-shadow duration-200 bg-white overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Home className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <span className="text-lg font-medium text-gray-900 mr-2">
                  {property.roadAddress}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    PropertyTypeColors[property.propertyType].bg
                  } ${PropertyTypeColors[property.propertyType].text}`}
                >
                  {PropertyTypeLabels[property.propertyType]}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1 text-left">{property.detailAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyListItem;
