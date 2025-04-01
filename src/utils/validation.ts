import { z } from 'zod';

// 이메일 유효성 검사
export const emailSchema = z.string().email('유효한 이메일 주소를 입력해주세요.');

// 비밀번호 유효성 검사 (최소 8자, 영문, 숫자, 특수문자 포함)
export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .regex(
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'
  );

// 전화번호 유효성 검사 (010-1234-5678 형식)
export const phoneSchema = z
  .string()
  .regex(/^\d{2,3}-\d{3,4}-\d{4}$/, '유효한 전화번호 형식을 입력해주세요. (예: 010-1234-5678)');

// 회원가입 스키마
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
    name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
    licenseNumber: z.string().optional(),
    phone: phoneSchema,
    agencyName: z.string().optional(),
    agencyBusinessNumber: z.string().optional(),
    agencyAddress: z.string().optional(),
    agencyRoadAddress: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

// 이메일 인증 스키마
export const emailVerificationSchema = z.object({
  email: emailSchema,
  code: z.string().length(6, '인증번호는 6자리입니다.'),
});
