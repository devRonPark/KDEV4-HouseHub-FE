'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Calendar, Tag } from 'react-feather';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import DatePicker from '../../components/ui/DatePicker';
import type { CreateCustomerReqDto, Customer } from '../../types/customer';
import type { TagResDto } from '../../types/tag';
import { getTags } from '../../api/tag';
import { useToast } from '../../context/useToast';

interface Option {
  value: string;
  label: string;
}

const genderOptions: Option[] = [
  { value: '', label: '선택 안 함' },
  { value: 'M', label: '남성' },
  { value: 'F', label: '여성' },
];

// 유효성 검사 스키마
const customerSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 2자 이상 50자 이하 여야 합니다.')
    .max(50, '이름은 2자 이상 50자 이하 여야 합니다.')
    .optional()
    .or(z.literal('')),
  email: z.string().email('유효한 이메일 주소를 입력해주세요.').optional().or(z.literal('')),
  contact: z
    .string()
    .regex(/^\d{2,3}-\d{3,4}-\d{4}$/, '유효한 전화번호 형식을 입력해주세요. (예: 010-1234-5678)'),
  memo: z.preprocess((val) => (val === '' ? null : val), z.string().nullable()).optional(),
  birthDate: z.string().optional(),
  gender: z.preprocess((val) => (val === '' ? undefined : val), z.enum(['M', 'F']).optional()),
  tagIds: z.array(z.number()).optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CreateCustomerReqDto) => void;
  onCancel: () => void;
}

const CustomerForm = ({ initialData, onSubmit, onCancel }: CustomerFormProps) => {
  const { showToast } = useToast();
  const [tags, setTags] = useState<TagResDto[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(() => {
    if (initialData?.tags && initialData.tags.length > 0) {
      return initialData.tags.map((tag) => tag.tagId);
    }
    return [];
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      contact: initialData?.contact || '',
      memo: initialData?.memo,
      birthDate: initialData?.birthDate || '',
      gender: initialData?.gender || undefined,
      tagIds: initialData?.tagIds || [],
    },
  });

  // initialData 변경 시 폼 상태 리셋
  useEffect(() => {
    reset({
      name: initialData?.name || '',
      email: initialData?.email || '',
      contact: initialData?.contact || '',
      memo: initialData?.memo,
      birthDate: initialData?.birthDate || '',
      gender: initialData?.gender || undefined,
      tagIds: initialData?.tagIds || [],
    });
  }, [initialData, reset]);

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
    setSelectedTagIds((prev) => {
      // 같은 타입의 태그가 이미 선택되어 있는지 확인
      const selectedTag = tags.find((tag) => tag.tagId === tagId);
      if (!selectedTag) return prev;

      // 같은 타입의 다른 태그가 선택되어 있는지 확인
      const sameTypeTag = tags.find(
        (tag) => tag.type === selectedTag.type && prev.includes(tag.tagId) && tag.tagId !== tagId
      );

      if (sameTypeTag) {
        // 같은 타입의 다른 태그가 선택되어 있다면, 해당 태그를 제거하고 새로운 태그를 추가
        return [...prev.filter((id) => id !== sameTypeTag.tagId), tagId];
      } else {
        // 같은 타입의 태그가 선택되어 있지 않다면, 토글
        if (prev.includes(tagId)) {
          return prev.filter((id) => id !== tagId);
        } else {
          return [...prev, tagId];
        }
      }
    });
  };

  // 폼 제출 처리
  const onFormSubmit = (data: CustomerFormData) => {
    // 먼저 기본 데이터로 객체 생성
    const customerData: CreateCustomerReqDto = {
      contact: data.contact,
      tagIds: selectedTagIds,
    };

    // 선택적 필드는 값이 있을 때만 추가
    if (data.name) {
      customerData.name = data.name;
    }

    if (data.email) {
      customerData.email = data.email;
    }

    if (data.birthDate) {
      customerData.birthDate = data.birthDate;
    }

    if (data.gender !== undefined) {
      customerData.gender = data.gender as 'M' | 'F';
    }

    if (data.memo) {
      customerData.memo = data.memo;
    }

    onSubmit(customerData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 기본 정보 섹션 */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">기본 정보</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="이름"
                    placeholder="고객 이름"
                    error={errors.name?.message}
                    leftIcon={<User size={18} />}
                  />
                )}
              />
            </div>

            <div className="col-span-2">
              <Controller
                name="contact"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="연락처"
                    placeholder="010-0000-0000"
                    error={errors.contact?.message}
                    leftIcon={<Phone size={18} />}
                    required
                  />
                )}
              />
            </div>

            <div className="col-span-2">
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="이메일"
                    type="email"
                    placeholder="example@example.com"
                    error={errors.email?.message}
                    leftIcon={<Mail size={18} />}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="생년월일"
                    placeholder="YYYY-MM-DD"
                    error={errors.birthDate?.message}
                    leftIcon={<Calendar size={18} />}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value ?? ''}
                    label="성별"
                    options={genderOptions}
                    error={errors.gender?.message}
                    className="h-[42px]"
                  />
                )}
              />
            </div>

            <div className="col-span-2">
              <Controller
                name="memo"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    label="메모"
                    placeholder="고객에 대한 추가 정보를 입력하세요"
                    error={errors.memo?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* 태그 정보 섹션 */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">태그 정보</h3>

          {/* 태그 목록 */}
          <div className="bg-gray-50 p-3 rounded-lg max-h-[500px] overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-800 mb-3 sticky top-0 bg-gray-50 py-1">
              사용 가능한 태그
            </h3>
            {isLoadingTags ? (
              <div className="text-sm text-gray-600">태그 목록을 불러오는 중...</div>
            ) : Object.keys(groupedTags).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(groupedTags).map(([type, typeTags]) => (
                  <div key={type} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 sticky top-8 bg-gray-50 py-1">
                      {type}
                    </h4>
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
      </div>

      <div className="flex justify-end space-x-3 pt-3 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          저장
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
