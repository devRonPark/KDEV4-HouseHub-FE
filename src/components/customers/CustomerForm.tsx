'use client';

// import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone } from 'react-feather';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import type { Customer, CreateCustomerReqDto } from '../../types/customer';

// Select 박스 옵션 생성
const ageOptions = Array.from({ length: 10 }, (_, i) => (i + 1) * 10); // [10, 20, ..., 100]

// 유효성 검사 스키마
const customerSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 2자 이상 50자 이하 여야 합니다.')
    .max(50, '이름은 2자 이상 50자 이하 여야 합니다.'),
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  contact: z
    .string()
    .regex(/^\d{2,3}-\d{3,4}-\d{4}$/, '유효한 전화번호 형식을 입력해주세요. (예: 010-1234-5678)'),
  memo: z.preprocess((val) => (val === '' ? null : val), z.string().nullable()).optional(),
  ageGroup: z.preprocess((val) => {
    if (val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().min(10).max(100).optional()),
  gender: z.preprocess((val) => (val === '' ? undefined : val), z.enum(['M', 'F']).optional()),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Partial<Customer>;
  onSubmit: (data: CreateCustomerReqDto) => void;
  onCancel: () => void;
}

const CustomerForm = ({ initialData, onSubmit, onCancel }: CustomerFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    // 수정 후 (ageGroup, gender 초기화)
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      contact: initialData?.contact || '',
      memo: initialData?.memo,
      // 초기값이 없으면 undefined로 설정 (중요: null이 아님)
      ageGroup: initialData?.ageGroup,
      gender: initialData?.gender,
    },
  });

  // 폼 제출 처리
  const onFormSubmit = (data: CustomerFormData) => {
    // 먼저 기본 데이터로 객체 생성
    const customerData: CreateCustomerReqDto = {
      name: data.name,
      email: data.email,
      contact: data.contact,
    };

    // 선택적 필드는 값이 있을 때만 추가
    if (data.ageGroup !== undefined) {
      customerData.ageGroup = Number(data.ageGroup);
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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 기본 정보 섹션 */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900">기본 정보</h3>
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
                required
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  required
                />
              )}
            />

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="ageGroup"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="연령대"
                  options={[
                    { value: '', label: '선택 안 함' },
                    ...ageOptions.map((age) => ({
                      value: age.toString(), // 문자열로 변환
                      label: `${age}`,
                    })),
                  ]}
                  error={errors.ageGroup?.message}
                />
              )}
            />
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="성별"
                  options={[
                    { value: '', label: '선택 안 함' },
                    { value: 'M', label: '남성' },
                    { value: 'F', label: '여성' },
                  ]}
                  error={errors.gender?.message}
                />
              )}
            />
          </div>

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

      <div className="flex justify-end space-x-3 pt-4 border-t">
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
