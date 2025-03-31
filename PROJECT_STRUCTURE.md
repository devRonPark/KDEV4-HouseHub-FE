# 부동산 CRM 프로젝트 폴더 구조

## 프로젝트 개요
이 문서는 부동산 CRM 프로젝트의 폴더 구조와 각 폴더의 목적을 설명합니다.

## 최상위 폴더 구조
KDEV4-HOUSEHUB-FE/
├── docs/                  # 프로젝트 문서
├── public/                # 정적 파일
├── src/                   # 소스 코드
├── .env                   # 환경 변수
├── .eslintrc.json         # ESLint 설정
├── .gitignore             # Git 무시 파일 목록
├── .prettierrc            # Prettier 설정
├── CONTRIBUTING.md        # 기여 가이드라인
├── index.html             # 진입점 HTML
├── package.json           # 패키지 정보 및 스크립트
├── README.md              # 프로젝트 개요
├── tailwind.config.js     # Tailwind CSS 설정
├── tsconfig.json          # TypeScript 설정
└── vite.config.ts         # Vite 설정


## src 폴더 구조
src/
├── api/                   # API 통신 관련 코드
├── assets/                # 이미지, 폰트 등 정적 자산
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/                # 기본 UI 컴포넌트
│   └── layout/            # 레이아웃 관련 컴포넌트
├── config/                # 설정 파일
├── context/               # React Context 관련 코드
├── hooks/                 # 커스텀 훅
├── pages/                 # 페이지 컴포넌트
│   ├── admin/             # 관리자 페이지
│   └── public/            # 공개 페이지
├── styles/                # 전역 스타일
├── test/                  # 테스트 관련 파일
├── types/                 # TypeScript 타입 정의
├── utils/                 # 유틸리티 함수
├── App.tsx                # 앱 컴포넌트
├── index.css              # 전역 CSS
├── main.tsx               # 앱 진입점
└── vite-env.d.ts          # Vite 환경 타입 정의

## 주요 폴더 설명

### api/
백엔드 API와의 통신을 담당하는 함수들을 모듈화하여 관리합니다.
- `auth.ts`: 인증 관련 API
- `templates.ts`: 템플릿 관련 API
- `submissions.ts`: 문의 내역 관련 API

### components/
재사용 가능한 컴포넌트를 모듈화하여 관리합니다.
- `ui/`: 버튼, 폼, 테이블 등 기본적인 UI 컴포넌트
- `layout/`: 페이지 레이아웃과 관련된 컴포넌트
- 루트 레벨: 특정 도메인에 종속된 컴포넌트

### context/
전역 상태 관리를 위한 컨텍스트를 정의합니다.
- `AuthContext.tsx`: 인증 관련 컨텍스트

### pages/
라우팅 가능한 페이지 컴포넌트를 관리합니다.
- `admin/`: 관리자 권한이 필요한 페이지
- `public/`: 인증 없이 접근 가능한 페이지

### types/
프로젝트 전반에서 사용되는 타입을 정의하고 관리합니다.
- `form.ts`: 폼 관련 타입
- `template.ts`: 템플릿 관련 타입
- `submission.ts`: 문의 내역 관련 타입
- `table.ts`: 테이블 관련 타입

### utils/
재사용 가능한 유틸리티 함수를 모듈화하여 관리합니다.
- `date.ts`: 날짜 관련 유틸리티
- `storage.ts`: 로컬 스토리지 관련 유틸리티
- `clipboard.ts`: 클립보드 관련 유틸리티

## 파일 명명 규칙

- **컴포넌트**: 파스칼 케이스(PascalCase) - `Button.tsx`, `UserProfile.tsx`
- **유틸리티/훅**: 카멜 케이스(camelCase) - `useForm.ts`, `dateUtils.ts`
- **타입 정의**: 카멜 케이스(camelCase) - `form.ts`, `user.ts`
- **테스트 파일**: 테스트 대상 파일명 + `.test.ts` 또는 `.spec.ts`

## 모듈 간 의존성

pages → components → hooks → utils/api
↓
context

## 확장 가이드라인

### 새 기능 추가
1. 필요한 타입을 `types/` 폴더에 정의
2. API 통신 함수를 `api/` 폴더에 추가
3. 필요한 유틸리티 함수를 `utils/` 폴더에 추가
4. 재사용 가능한 컴포넌트를 `components/` 폴더에 추가
5. 페이지 컴포넌트를 `pages/` 폴더에 추가
6. 필요한 경우 라우트를 `App.tsx`에 추가

### 코드 품질 관리
- ESLint와 Prettier를 사용하여 일관된 코드 스타일 유지
- 복잡한 함수나 컴포넌트는 JSDoc 주석으로 문서화
- 중요한 컴포넌트와 유틸리티 함수에 대한 단위 테스트 작성
