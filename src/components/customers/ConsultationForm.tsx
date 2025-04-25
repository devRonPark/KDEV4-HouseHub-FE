'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar } from 'react-feather';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import type { Consultation } from '../../types/consultation';
import { ConsultationStatus, ConsultationType } from '../../types/consultation';

// 유효성 검사 스키마
const consultationSchema = z.object({
  consultationType: z.enum(['PHONE', 'VISIT']) as z.ZodType<ConsultationType>,
  content: z.string().min(1, '상담 내용은 필수 입력 항목입니다.'),
  consultationDate: z.string().optional(),
  status: z.enum(['RESERVED', 'COMPLETED', 'CANCELED']),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

interface ConsultationFormProps {
  customerId: number;
  initialData?: Partial<Consultation>;
  onSubmit: (data: Partial<Consultation>) => void;
  onCancel: () => void;
}

const ConsultationForm = ({
  customerId,
  initialData,
  onSubmit,
  onCancel,
}: ConsultationFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      consultationType: initialData?.consultationType || 'PHONE',
      content: initialData?.content || '',
      consultationDate: initialData?.consultationDate
        ? new Date(initialData.consultationDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      status: initialData?.status || 'RESERVED',
    },
  });

  const onFormSubmit = (data: ConsultationFormData) => {
    const consultationData: Partial<Consultation> = {
      customer: {
        id: customerId,
        name: '',
        email: '',
        contact: '',
      },
      content: data.content,
      status: ConsultationStatus.RESERVED,
      consultationType: data.consultationType,
      consultationDate: data.consultationDate
        ? new Date(data.consultationDate).toISOString().split('T')[0]
        : undefined,
    };

    onSubmit(consultationData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Controller
          name="consultationType"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="상담 유형"
              options={[
                { value: 'PHONE', label: '전화 상담' },
                { value: 'VISIT', label: '방문 상담' },
              ]}
              error={errors.consultationType?.message}
            />
          )}
        />

        <Controller
          name="consultationDate"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="date"
              label="상담 일자"
              leftIcon={<Calendar size={18} />}
              error={errors.consultationDate?.message}
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

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="상담 상태"
              options={[
                { value: 'RESERVED', label: '예약됨' },
                { value: 'COMPLETED', label: '완료' },
                { value: 'CANCELED', label: '취소됨' },
              ]}
              error={errors.status?.message}
            />
          )}
        />
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
