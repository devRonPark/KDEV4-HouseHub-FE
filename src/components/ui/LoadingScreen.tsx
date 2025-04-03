import type React from 'react';
import LogoWithText from '../LogoWithText';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="mb-8">
        <LogoWithText width={240} height={60} />
      </div>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      <p className="mt-4 text-gray-600">로딩 중...</p>
    </div>
  );
};

export default LoadingScreen;
