'use client';

import { useEffect, useState } from 'react';
import { getMyProfile } from '../../api/agent';
import type { AgentDetail } from '../../types/agent';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import ProfileForm from './ProfileForm';
import { User, Phone, Mail, FileText } from 'react-feather';

function MyPage() {
  const [profile, setProfile] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const result = await getMyProfile();
      if (result.success) {
        setProfile(result.data!);
        setError(null);
      } else {
        setError(result.error || '알 수 없는 오류가 발생했습니다.');
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!profile) return null;

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">내 프로필</h1>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="mt-3 sm:mt-0 px-4 py-2 bg-blue-500 text-white rounded"
        >
          내 프로필 수정
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 bg-white shadow-md">
          <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">이름</p>
                <p className="text-gray-900">{profile.name || '미등록'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Phone size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">연락처</p>
                <p className="text-gray-900">{profile.contact || '미등록'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Mail size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">이메일</p>
                <p className="text-gray-900">{profile.email || '미등록'}</p>
              </div>
            </div>

            {profile.licenseNumber && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <FileText size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">자격증 번호</p>
                  <p className="text-gray-900">{profile.licenseNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-md">
          <h2 className="text-lg font-medium text-gray-900 mb-4">소속 부동산 정보</h2>
          {profile.realEstate ? (
            <div>
              <p className="text-sm font-medium text-gray-500">부동산 이름</p>
              <p className="text-gray-900">{profile.realEstate.name || '미등록'}</p>
              <p className="text-sm font-medium text-gray-500">부동산 연락처</p>
              <p className="text-gray-900">{profile.realEstate.contact || '미등록'}</p>
            </div>
          ) : (
            <p className="text-gray-500">소속 부동산 정보가 없습니다.</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="내 프로필 수정"
        size="lg"
      >
        <ProfileForm
          initialData={profile}
          onSubmit={(data) => {
            const updatedProfile: AgentDetail = {
              ...profile!,
              ...data,
            };
            setProfile(updatedProfile);
            setIsEditModalOpen(false);
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </DashboardLayout>
  );
}

export default MyPage;
