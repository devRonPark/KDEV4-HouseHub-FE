'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'react-feather';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { sendPasswordResetEmail } from '../../api/auth';
import { VerificationType } from '../../types/auth';

// 이메일 유효성 검사를 위한 스키마
const resetPasswordSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ForgetPassword() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  // 현재 이메일 값 감시
  const emailValue = watch('email');
  // 이메일 필드가 수정되었고 오류가 없는 경우 유효함
  const isEmailValid = isDirty && !!emailValue && !errors.email;

  const onSubmit = async (formData: ResetPasswordFormData) => {
    try {
      setStatus('loading');
      setShowAlert(false);

      const data = await sendPasswordResetEmail(formData.email, VerificationType.PASSWORD_RESET);

      if (data.success) {
        setStatus('success');
        setMessage(`비밀번호 재설정 링크를 ${formData.email}로 보냈습니다.`);
        setShowAlert(true);
      } else {
        setStatus('error');
        setMessage(data.message || '입력하신 이메일로 가입된 계정을 찾을 수 없습니다.');
        setShowAlert(true);
      }
    } catch {
      setStatus('error');
      setMessage('서비스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setShowAlert(true);
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  return (
    <AuthLayout
      title="비밀번호 찾기"
      subtitle="가입 시 사용한 이메일 주소를 입력해주세요. 비밀번호 재설정 링크를 보내드립니다."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="이메일"
              placeholder="이메일 주소"
              type="email"
              required
              leftIcon={<Mail size={18} />}
              error={errors.email?.message}
              isValid={isEmailValid}
            />
          )}
        />

        {showAlert && (
          <Alert
            variant={status === 'success' ? 'success' : 'error'}
            description={message}
            onClose={closeAlert}
          />
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          isLoading={status === 'loading'}
          disabled={!isValid || !isDirty}
          className="rounded-xl"
        >
          비밀번호 재설정 메일 보내기
        </Button>

        <div className="flex justify-center">
          <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            로그인 화면으로 돌아가기
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
