'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Calendar } from 'react-feather';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import DatePicker from '../../components/ui/DatePicker';
import TagSelector from '../tag/TagSelector';
import type { CreateCustomerReqDto, Customer } from '../../types/customer';

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
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(() => {
    if (initialData?.tags && initialData.tags.length > 0) {
      return initialData.tags.map((tag) => tag.tagId);
    }
    return [];
  });

  // 현재 날짜 기준으로 19년 전 날짜 계산
  const getDefaultBirthDate = () => {
    const today = new Date();
    const year = today.getFullYear() - 19;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 연락처 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');

    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

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
      birthDate: initialData?.birthDate || getDefaultBirthDate(),
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
      birthDate: initialData?.birthDate || getDefaultBirthDate(),
      gender: initialData?.gender || undefined,
      tagIds: initialData?.tagIds || [],
    });
  }, [initialData, reset]);

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
                    onChange={(e) => {
                      const formattedValue = formatPhoneNumber(e.target.value);
                      field.onChange(formattedValue);
                    }}
                    maxLength={13} // 010-0000-0000 형식의 최대 길이
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
                    max={getDefaultBirthDate()} // 최대값을 현재 날짜 기준 19년 전으로 설정
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
        <TagSelector selectedTagIds={selectedTagIds} onTagChange={setSelectedTagIds} />
      </div>

      <div className="flex justify-end space-x-3 pt-3 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {initialData ? '수정하기' : '등록하기'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
