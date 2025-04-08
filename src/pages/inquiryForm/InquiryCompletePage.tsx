import type React from 'react';
import LogoWithText from '../../components/LogoWithText';

const InquiryCompletePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <LogoWithText width={240} height={60} className="mx-auto" />
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              문의가 정상적으로 접수되었습니다.
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              문의하신 내용은 담당자가 확인 후 문자 또는 이메일로 회신드릴 예정입니다.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} HouseHub. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default InquiryCompletePage;
