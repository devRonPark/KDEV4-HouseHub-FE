'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Eye, EyeOff, Mail } from 'react-feather';

import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import useToast from '../../hooks/useToast';
import { signInSchema } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, error: authError } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [validFields, setValidFields] = useState<Record<string, boolean>>({});

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, dirtyFields },
    getValues,
    trigger,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  // 필드 변경 감지 및 유효성 검사를 위한 단일 useEffect
  useEffect(() => {
    // 변경된 필드 감지를 위한 함수
    const validateField = async (fieldName: keyof SignInFormData) => {
      // 필드가 수정되었는지 확인
      if (dirtyFields[fieldName]) {
        // 유효성 검사 실행
        const isValid = await trigger(fieldName);

        // 상태 업데이트 (이전 상태를 기반으로 특정 필드만 업데이트)
        setValidFields((prev) => ({
          ...prev,
          [fieldName]: isValid,
        }));
      }
    };

    // 필드 변경 감지를 위한 구독 설정
    const subscription = watch((value, { name, type }) => {
      // 값이 변경된 경우에만 유효성 검사 실행
      if (name && type === 'change') {
        validateField(name as keyof SignInFormData);
      }
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => subscription.unsubscribe();
  }, [watch, trigger, dirtyFields, getValues]);

  // 로그인 버튼 클릭 시 호출되는 함수
  // 로그인 성공 시 대시보드로 리다이렉트
  // 로그인 실패 시 에러 메시지 표시
  const onSubmit = async (data: SignInFormData) => {
    try {
      const success = await signIn(data.email, data.password);

      if (success) {
        showToast('로그인 성공', 'success');
        navigate('/dashboard');
      } else {
        showToast('로그인 실패: 이메일 또는 비밀번호를 확인하세요.', 'error');
      }
    } catch (error) {
      showToast('로그인 중 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <AuthLayout title="로그인" subtitle="계정 정보를 입력하여 로그인하세요.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 이메일 */}
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
              isValid={validFields.email}
            />
          )}
        />

        {/* 비밀번호 */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호 입력"
              error={errors.password?.message}
              required
              isValid={validFields.password}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          )}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              로그인 상태 유지
            </label>
          </div>

          <div className="text-sm">
            <Link to="/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        </div>

        <div>
          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            로그인
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              회원가입
            </Link>
          </p>
        </div>
      </form>

      {toast.isVisible && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={hideToast}
          isVisible={toast.isVisible}
        />
      )}
    </AuthLayout>
  );
};

export default SignIn;
