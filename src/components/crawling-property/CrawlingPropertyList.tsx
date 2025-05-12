import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchCrawlingPropertiesWithTags } from '../../api/crawling-property';
import type {
  CrawlingPropertySearchParams,
  CrawlingPropertyItem,
} from '../../types/crawling-property';
import LoadingScreen from '../ui/LoadingScreen';
import { CrawlingPropertyCard } from './CrawlingPropertyCard';
import { CrawlingPropertyModal } from './CrawlingPropertyModal';
import Pagination from '../ui/Pagination';

interface CrawlingPropertyListProps {
  searchParams: CrawlingPropertySearchParams;
  page: number;
  onPageChange: (page: number) => void;
}

export const CrawlingPropertyList = ({
  searchParams,
  page,
  onPageChange,
}: CrawlingPropertyListProps) => {
  const [selectedProperty, setSelectedProperty] = useState<CrawlingPropertyItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['crawlingProperties', { ...searchParams, page }],
    queryFn: () => searchCrawlingPropertiesWithTags({ ...searchParams, page: page - 1, size: 10 }),
  });

  if (isLoading) return <LoadingScreen />;

  const properties = data?.data?.content || [];
  const pagination = data?.data?.pagination;

  if (!properties.length) {
    return <div className="text-center py-8 text-gray-500">검색 결과가 없습니다.</div>;
  }

  return (
    <div>
      <div className="space-y-4">
        {properties.map((property: CrawlingPropertyItem) => (
          <CrawlingPropertyCard
            key={property.crawlingPropertiesId}
            property={property}
            onClick={() => setSelectedProperty(property)}
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {selectedProperty && (
        <CrawlingPropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
};
