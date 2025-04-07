'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar } from 'react-feather';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import type { Consultation, ConsultationType } from '../../types/consultation';
import type { FindPropertyResDto } from '../../types/property';

// 유효성 검사 스키마
const consultationSchema = z.object({
  type: z.enum(['visit', 'phone', 'email', 'other']),
  content: z.string().min(1, '상담 내용은 필수 입력 항목입니다.'),
  date: z.string().optional(),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

interface ConsultationFormProps {
  customerId: number;
  initialData?: Partial<Consultation>;
  onSubmit: (data: Partial<Consultation>) => void;
  onCancel: () => void;
}

// 임시 매물 데이터
// const MOCK_PROPERTIES: FindPropertyResDto[] = [
//   {
//     id: 6,
//     propertyType: PropertyType.OFFICETEL,
//     name: '테헤란로 스카이 오피스텔',
//     type: '오피스텔',
//     location: '강남구',
//     price: 68000,
//     size: 24,
//     description: '역세권 신축 오피스텔, 풀옵션',
//     images: ['property1.jpg'],
//   },
//   {
//     id: 'prop2',
//     name: '강남 센트럴 아파트',
//     type: '아파트',
//     location: '강남구',
//     price: 120000,
//     size: 32,
//     description: '강남역 도보 10분, 신축 아파트',
//     images: ['property2.jpg'],
//   },
//   {
//     id: 'prop3',
//     name: '서초 그린 아파트',
//     type: '아파트',
//     location: '서초구',
//     price: 95000,
//     size: 29,
//     description: '조용한 주택가, 학군 우수',
//     images: ['property3.jpg'],
//   },
//   {
//     id: 'prop4',
//     name: '마포 리버뷰 빌라',
//     type: '빌라',
//     location: '마포구',
//     price: 45000,
//     size: 22,
//     description: '한강 조망 가능, 교통 편리',
//     images: ['property4.jpg'],
//   },
// ];

const ConsultationForm = ({
  customerId,
  initialData,
  onSubmit,
  onCancel,
}: ConsultationFormProps) => {
  const [selectedProperties] = useState<FindPropertyResDto[]>(initialData?.relatedProperties || []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      type: (initialData?.type as ConsultationType) || 'visit',
      content: initialData?.content || '',
      date: initialData?.date
        ? new Date(initialData.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    },
  });

  // 매물 선택 토글
  // const toggleProperty = (property: FindPropertyResDto) => {
  //   setSelectedProperties((prev) => {
  //     const isSelected = prev.some((p) => p.id === property.id);
  //     if (isSelected) {
  //       return prev.filter((p) => p.id !== property.id);
  //     } else {
  //       return [...prev, property];
  //     }
  //   });
  // };

  // 폼 제출 처리
  const onFormSubmit = (data: ConsultationFormData) => {
    const consultationData: Partial<Consultation> = {
      ...data,
      customerId: customerId.toString(),
      relatedProperties: selectedProperties,
    };

    onSubmit(consultationData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="상담 유형"
              options={[
                { value: 'visit', label: '방문 상담' },
                { value: 'phone', label: '전화 상담' },
                { value: 'email', label: '이메일 상담' },
                { value: 'other', label: '기타' },
              ]}
              error={errors.type?.message}
            />
          )}
        />

        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="date"
              label="상담 일자"
              leftIcon={<Calendar size={18} />}
              error={errors.date?.message}
            />
          )}
        />

        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              label="상담 내용"
              placeholder="상담 내용을 상세히 기록해주세요"
              error={errors.content?.message}
              required
            />
          )}
        />

        {/* <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">관련 매물</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {MOCK_PROPERTIES.map((property) => (
              <div
                key={property.id}
                className={`p-3 border rounded-md cursor-pointer ${
                  selectedProperties.some((p) => p.id === property.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => toggleProperty(property)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Home size={16} className="text-gray-500" />
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-medium">{property.name}</div>
                    <div className="text-xs text-gray-500">
                      {property.type} | {property.location} | {property.size}평 |{' '}
                      {property.price.toLocaleString()}만원
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div> */}
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

export default ConsultationForm;
