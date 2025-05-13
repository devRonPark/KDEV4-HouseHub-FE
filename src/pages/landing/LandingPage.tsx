'use client';

import { ArrowRight, MessageSquare, Users, Home, BarChart, FileText, Menu, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import FeatureCard from '../../components/landing/FeatureCard';
import StepCard from '../../components/landing/StepCard';
import { useNavigate } from 'react-router-dom';
import LogoWithText from '../../components/LogoWithText';
import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

// 애니메이션 효과를 위한 컴포넌트
const AnimatedSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: 'easeOut',
            delay: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 모바일 메뉴가 열렸을 때 스크롤 방지
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // 스크롤 시 헤더 스타일 변경
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 w-full border-b bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoWithText width={160} height={40} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              주요 기능
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              이용 방법
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/signin')}>
              로그인
            </Button>
            <Button onClick={() => navigate('/signup')}>무료로 시작하기</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 top-16 bg-white z-40 p-4 flex flex-col"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-4 py-6">
              <a
                href="#features"
                className="text-lg font-medium py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                주요 기능
              </a>
              <a
                href="#how-it-works"
                className="text-lg font-medium py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                이용 방법
              </a>
            </div>
            <div className="mt-auto flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigate('/signin');
                  setMobileMenuOpen(false);
                }}
              >
                로그인
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  navigate('/signup');
                  setMobileMenuOpen(false);
                }}
              >
                무료로 시작하기
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24 overflow-hidden">
          <div className="container grid gap-8 md:grid-cols-2 md:gap-12">
            <motion.div
              className="flex flex-col justify-center space-y-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                흩어진 고객 정보, HouseHub 하나로{' '}
                <span className="text-blue-600">쉽고 빠르게 관리</span>하세요
              </h1>
              <p className="text-gray-600 md:text-lg">
                고객 문의 등록부터 맞춤 매물 추천, 계약 진행, 자동 후속 관리까지 — 복잡했던 중개
                업무를 HouseHub에서 통합하여 효율을 높여보세요.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="gap-2 group" onClick={() => navigate('/signup')}>
                  무료로 시작하고 업무 효율 높이기
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="transition-all hover:bg-gray-50">
                  HouseHub 데모 영상으로 미리보기
                </Button>
              </div>
            </motion.div>
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              <div className="relative h-[300px] w-full max-w-[500px] overflow-hidden rounded-lg shadow-xl md:h-[400px] transform transition-transform hover:scale-[1.02] hover:shadow-2xl">
                <img
                  src="/dashboard.png"
                  alt="HouseHub CRM 대시보드"
                  className="object-cover w-full h-full"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Problem & Solution Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <AnimatedSection>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="mb-6 text-3xl font-bold tracking-tighter sm:text-4xl">
                  중개 업무의 <span className="text-blue-600">비효율적인 순간들</span>, 이제
                  HouseHub로 해결하세요
                </h2>
                <p className="mb-12 text-gray-600 md:text-lg">
                  HouseHub는 흩어진 정보를 통합하고 반복적인 업무를 자동화하여 중개사무소의 생산성을
                  혁신적으로 향상시킵니다.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid gap-8 md:grid-cols-3">
              <AnimatedSection delay={0.1}>
                <div className="rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">수기 기록과 정보 누락의 잦은 발생</h3>
                  <p className="text-gray-600">
                    손으로 적는 고객 정보와 상담 내용은 체계적인 관리가 어렵고, 중요한 정보를
                    놓치거나 분실할 위험이 큽니다.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <BarChart className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">
                    다양한 툴 사용으로 인한 업무 비효율 심화
                  </h3>
                  <p className="text-gray-600">
                    고객 관리, 매물 정보, 계약 서류 등을 여러 프로그램과 수동 작업으로 처리하며 시간
                    낭비와 오류 발생 가능성이 증가합니다.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <div className="rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">
                    체계적인 고객 관리 부재로 인한 서비스 품질 저하
                  </h3>
                  <p className="text-gray-600">
                    고객의 정보와 선호도를 제대로 파악하고 관리하지 못해 개인화된 맞춤형 서비스를
                    제공하기 어렵습니다.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section id="features" className="bg-gray-50 py-16 md:py-24 relative">
          {/* 배경 장식 요소 */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full opacity-20"></div>
            <div className="absolute bottom-20 right-10 w-60 h-60 bg-blue-100 rounded-full opacity-20"></div>
          </div>

          <div className="container relative z-10">
            <AnimatedSection>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="mb-6 text-3xl font-bold tracking-tighter sm:text-4xl">
                  <span className="text-blue-600">업무 효율을 극대화하는</span> HouseHub 핵심 기능
                </h2>
                <p className="mb-12 text-gray-600 md:text-lg">
                  HouseHub는 고객 관리부터 계약, 매물 관리까지 중개사무소의 모든 업무 과정을
                  혁신하여 불필요한 시간 낭비를 줄이고 생산성을 높여줍니다.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <AnimatedSection delay={0.1}>
                <FeatureCard
                  icon={<Users className="h-6 w-6 text-blue-600" />}
                  title="고객 정보 통합 관리로 업무 혼선 제로화"
                  description="흩어져 있던 고객 정보, 상담 이력, 계약 진행 상황을 한 곳에서 관리하여 빠르고 정확한 업무 처리를 지원합니다."
                />
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <FeatureCard
                  icon={<Home className="h-6 w-6 text-blue-600" />}
                  title="맞춤 매물 추천으로 계약 성공률 UP"
                  description="고객과의 상담 내용을 바탕으로 최적의 매물을 쉽고 빠르게 추천하여 계약 성사 가능성을 높여줍니다."
                />
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <FeatureCard
                  icon={<FileText className="h-6 w-6 text-blue-600" />}
                  title="디지털 상담 기록으로 정보 관리 효율 증대"
                  description="손으로 적던 상담 내용을 디지털로 간편하게 기록하고 관리하여 필요할 때 언제든 빠르게 확인하고 활용할 수 있습니다."
                />
              </AnimatedSection>

              <AnimatedSection delay={0.4}>
                <FeatureCard
                  icon={<Home className="h-6 w-6 text-blue-600" />}
                  title="독립적인 매물 관리로 정확하고 빠른 정보 제공"
                  description="우리 사무소만의 매물 DB를 구축하고 관리하여 상담 시 최신 정보를 즉시 확인하고 고객에게 정확하게 제공할 수 있습니다."
                />
              </AnimatedSection>

              <AnimatedSection delay={0.5}>
                <FeatureCard
                  icon={<BarChart className="h-6 w-6 text-blue-600" />}
                  title="외부 매물 정보 연동으로 경쟁력 강화"
                  description="직방, 네이버 등 주요 부동산 플랫폼의 매물 정보를 한 곳에서 확인하여 시장 동향 파악 및 신규 매물 확보에 유리합니다."
                />
              </AnimatedSection>

              <AnimatedSection delay={0.6}>
                <FeatureCard
                  icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
                  title="자동 문자 발송으로 스마트한 고객 관계 관리"
                  description="생일 축하, 계약 만료 알림 등 반복적인 고객 커뮤니케이션을 자동화하여 효율적인 고객 관리를 지원하고 만족도를 높입니다."
                />
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24">
          <div className="container">
            <AnimatedSection>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="mb-6 text-3xl font-bold tracking-tighter sm:text-4xl">
                  <span className="text-blue-600">4단계 자동화</span>로 중개 업무 효율을
                  극대화하세요
                </h2>
                <p className="mb-12 text-gray-600 md:text-lg">
                  더 이상 반복적인 고객 관리에 시간을 낭비하지 마세요. HouseHub의 스마트 기능으로
                  핵심 업무에 집중하고, 계약 성공률과 고객 만족도를 동시에 높일 수 있습니다.
                </p>
              </div>
            </AnimatedSection>

            {/* 단계별 연결선 (데스크톱에서만 표시) */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-200 w-3/4 mt-24 z-0"></div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative">
              <AnimatedSection delay={0.1}>
                <StepCard
                  number="1"
                  title="자동 신규 고객 등록"
                  description="문의 접수부터 고객 정보 관리까지 자동으로! 엑셀 업로드와 수동 등록도 간편하게 지원합니다."
                />
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <StepCard
                  number="2"
                  title="맞춤 매물 추천 & 상담 기록"
                  description="고객 니즈에 맞는 매물을 빠르게 검색하고, 상담 내용을 기록하여 계약 가능성을 높입니다."
                />
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <StepCard
                  number="3"
                  title="체계적인 계약 진행 관리"
                  description="계약 단계를 시각적으로 관리하고 알림을 제공하여 효율적인 계약 진행을 돕습니다."
                />
              </AnimatedSection>

              <AnimatedSection delay={0.4}>
                <StepCard
                  number="4"
                  title="자동 후속 케어 & 관계 유지"
                  description="자동 발송되는 문자 메시지로 꾸준한 고객 관계를 유지하고 만족도를 높입니다."
                />
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <AnimatedSection>
              <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-center text-white shadow-xl md:p-12 transition-transform hover:scale-[1.01]">
                <h2 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl">
                  지금 바로 HouseHub로 더 스마트하게 일해보세요
                </h2>
                <p className="mb-8 md:text-lg">
                  14일 무료 체험으로 HouseHub의 모든 기능을 경험해보세요. 신용카드 정보가 필요하지
                  않습니다.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2 group"
                    onClick={() => navigate('/signup')}
                  >
                    무료로 시작하기
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent text-white hover:bg-blue-700 border-white"
                  >
                    데모 신청
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <LogoWithText width={160} height={40} />
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600">
                © 2025 PUSH_THE_BUTTON. 팀장: 박병찬. 팀원: 허성은, 이영석, 김현호
              </p>
              <p className="text-sm text-gray-600">
                <a href="#" className="text-blue-600 hover:underline">
                  개인정보처리방침
                </a>{' '}
                |{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  이용약관
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
