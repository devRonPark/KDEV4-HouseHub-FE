import { useState, useEffect } from 'react';
import { Tag } from 'react-feather';
import { getTags } from '../../api/tag';
import { useToast } from '../../context/useToast';
import type { TagResDto } from '../../types/tag';

interface TagSelectorProps {
  selectedTagIds: number[];
  onTagChange: (tagIds: number[]) => void;
  className?: string;
}

const TagSelector = ({ selectedTagIds, onTagChange, className = '' }: TagSelectorProps) => {
  const { showToast } = useToast();
  const [tags, setTags] = useState<TagResDto[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // 태그 목록 로드
  useEffect(() => {
    const loadTags = async () => {
      setIsLoadingTags(true);
      try {
        const response = await getTags();
        if (response.success && response.data) {
          setTags(response.data);
        } else {
          showToast(response.error || '태그 목록을 불러오는데 실패했습니다.', 'error');
        }
      } catch {
        showToast('태그 목록을 불러오는 중 오류가 발생했습니다.', 'error');
      } finally {
        setIsLoadingTags(false);
      }
    };

    loadTags();
  }, [showToast]);

  // 태그를 타입별로 그룹화
  const groupedTags = tags.reduce(
    (acc, tag) => {
      if (!acc[tag.type]) {
        acc[tag.type] = [];
      }
      acc[tag.type].push(tag);
      return acc;
    },
    {} as Record<string, TagResDto[]>
  );

  // 태그 선택/해제 처리
  const handleTagClick = (tagId: number) => {
    const selectedTag = tags.find((tag) => tag.tagId === tagId);
    if (!selectedTag) return;

    // 방 개수 태그인 경우
    if (selectedTag.type === '방 개수') {
      // 이미 선택된 방 개수 태그가 있는지 확인
      const existingRoomTag = tags.find(
        (tag) => tag.type === '방 개수' && selectedTagIds.includes(tag.tagId)
      );

      if (existingRoomTag) {
        // 이미 선택된 방 개수 태그가 있다면, 해당 태그를 제거하고 새로운 태그를 추가
        onTagChange([...selectedTagIds.filter((id) => id !== existingRoomTag.tagId), tagId]);
      } else {
        // 선택된 방 개수 태그가 없다면, 새로운 태그 추가
        onTagChange([...selectedTagIds, tagId]);
      }
    } else {
      // 방 개수가 아닌 다른 태그들은 자유롭게 선택 가능
      if (selectedTagIds.includes(tagId)) {
        onTagChange(selectedTagIds.filter((id) => id !== tagId));
      } else {
        onTagChange([...selectedTagIds, tagId]);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-lg font-medium text-gray-900">태그 정보</h2>

      {/* 태그 목록 */}
      <div className="bg-gray-50 p-3 rounded-lg max-h-[500px] overflow-y-auto">
        {isLoadingTags ? (
          <div className="text-sm text-gray-600">태그 목록을 불러오는 중...</div>
        ) : Object.keys(groupedTags).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(groupedTags).map(([type, typeTags]) => (
              <div key={type} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 py-1">{type}</h4>
                <div className="flex flex-wrap gap-2">
                  {typeTags.map((tag) => (
                    <button
                      key={tag.tagId}
                      type="button"
                      onClick={() => handleTagClick(tag.tagId)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        selectedTagIds.includes(tag.tagId)
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      <Tag size={12} className="mr-1" />
                      {tag.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-600">사용 가능한 태그가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default TagSelector;
