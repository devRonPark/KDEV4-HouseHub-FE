'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff } from 'react-feather';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resetPassword, validateResetToken } from '../../api/auth';

// 비밀번호 유효성 검사를 위한 스키마
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token as string;
  const navigate = useNavigate();

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // 토큰 유효성 검사
  useEffect(() => {
    const validateToken = async () => {
      try {
        // 실제 API 호출 대신 시뮬레이션 (토큰이 유효하다고 가정)
        const response = await validateResetToken(token);
        if (!response.success) {
          setIsTokenValid(false);
          setMessage('비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.');
          setShowAlert(true);
        } else {
          setIsTokenValid(true);
        }
      } catch {
        setIsTokenValid(false);
        setMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        setShowAlert(true);
      }
    };

    validateToken();
  }, [token]);

  // 현재 비밀번호 값 감시
  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  // 비밀번호 필드가 수정되었고 오류가 없는 경우 유효함
  const isPasswordValid = isDirty && !!passwordValue && !errors.password;
  const isConfirmPasswordValid =
    isDirty &&
    !!confirmPasswordValue &&
    !errors.confirmPassword &&
    passwordValue === confirmPasswordValue;

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setStatus('loading');
      setShowAlert(false);

      // 실제 API 호출 대신 시뮬레이션 (2초 후 성공)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 성공 상태로 변경
      setStatus('success');
      setMessage('비밀번호가 성공적으로 변경되었습니다.');
      setShowAlert(true);

      // 실제 구현 시 아래와 같이 API 호출
      const response = await resetPassword(token, data.password);

      if (response.success) {
        setStatus('success');
        setMessage('비밀번호가 성공적으로 변경되었습니다.');
        setShowAlert(true);
        navigate('/signin');
      } else {
        setStatus('error');
        setMessage(response.message || '비밀번호 재설정에 실패했습니다. 다시 시도해주세요.');
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
  console.log(isTokenValid);
  if (!isTokenValid) {
    console.log('Token is invalid or expired');
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F9FAFB]">
        <div className="w-full max-w-md">
          <Card
            title="유효하지 않은 링크"
            subtitle="비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다."
            className="rounded-2xl shadow-md"
            footer={
              <div className="flex justify-center">
                <Link
                  to="/reset-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  비밀번호 찾기 페이지로 돌아가기
                </Link>
              </div>
            }
          >
            <div className="text-center py-4">
              <p className="text-gray-600">새로운 비밀번호 재설정 링크를 요청해주세요.</p>
            </div>
            <Button
              variant="primary"
              fullWidth
              className="rounded-xl"
              onClick={() => (window.location.href = '/reset-password')}
            >
              비밀번호 찾기
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F9FAFB]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">비밀번호 재설정</h1>
        </div>

        <Card
          title="비밀번호 재설정"
          subtitle="새로운 비밀번호를 입력해주세요."
          className="rounded-2xl shadow-md"
          footer={
            <div className="flex justify-center">
              <Link to="/signin" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                로그인 화면으로 돌아가기
              </Link>
            </div>
          }
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="새 비밀번호"
                  placeholder="새 비밀번호 입력"
                  type={showPassword ? 'text' : 'password'}
                  required
                  leftIcon={<Lock size={18} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  error={errors.password?.message}
                  isValid={isPasswordValid}
                  helperText="8자 이상, 대소문자, 숫자, 특수문자 포함"
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="비밀번호 확인"
                  placeholder="비밀번호 확인"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  leftIcon={<Lock size={18} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  error={errors.confirmPassword?.message}
                  isValid={isConfirmPasswordValid}
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
              className="rounded-xl mt-2"
            >
              비밀번호 재설정
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
