import { Tag } from 'react-feather';
import type { TagResDto } from '../../types/tag';

interface TagListProps {
  tags: TagResDto[];
  className?: string;
}

const TagList = ({ tags, className = '' }: TagListProps) => {
  if (!tags || tags.length === 0) {
    return <span className="text-gray-500 text-xs">등록된 태그 없음</span>;
  }

  // 태그를 2줄로 나누어 표시 (각 줄 최대 4개)
  const firstLineTags = tags.slice(0, Math.min(3, tags.length));
  const secondLineTags = tags.slice(3, 6);
  const remainingCount = tags.length > 6 ? tags.length - 6 : 0;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex flex-wrap gap-1">
        {firstLineTags.map((tag) => (
          <span
            key={tag.tagId}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            <Tag size={12} className="mr-1" />
            {tag.type}: {tag.value}
          </span>
        ))}
      </div>
      {secondLineTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {secondLineTags.map((tag) => (
            <span
              key={tag.tagId}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              <Tag size={12} className="mr-1" />
              {tag.type}: {tag.value}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{remainingCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TagList;
