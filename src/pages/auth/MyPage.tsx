'use client';

import { useEffect, useState } from 'react';
import { getMyProfile } from '../../api/agent';
import type { AgentDetail } from '../../types/agent';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import ProfileForm from './ProfileForm';
import { User, Phone, Mail, FileText } from 'react-feather';
import { getAllTemplates } from '../../api/sms';
import type { TemplateResDto } from '../../types/sms';

function MyPage() {
  const [profile, setProfile] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateResDto[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileResult, templatesResult] = await Promise.all([
          getMyProfile(),
          getAllTemplates({ page: 1, size: 100, keyword: '' }),
        ]);

        if (profileResult.success) {
          setProfile(profileResult.data!);
          setError(null);
        } else {
          setError(profileResult.error || '알 수 없는 오류가 발생했습니다.');
        }

        if (templatesResult.success && templatesResult.data) {
          setTemplates(templatesResult.data.content || []);
        }
      } catch {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!profile) return null;

  const getTemplateTitle = (templateId?: string) => {
    if (!templateId) return '미설정';
    const template = templates.find((t) => t.id.toString() === templateId);
    return template ? template.title : '미설정';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-5 border-b">
          <h1 className="text-2xl font-bold text-gray-900">내 프로필</h1>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            프로필 수정
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">기본 정보</h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="text-gray-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">이름</p>
                  <p className="text-gray-900">{profile.name || '미등록'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Phone className="text-gray-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">연락처</p>
                  <p className="text-gray-900">{profile.contact || '미등록'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Mail className="text-gray-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">이메일</p>
                  <p className="text-gray-900">{profile.email || '미등록'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="text-gray-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">자격증 번호</p>
                  <p className="text-gray-900">{profile.licenseNumber || '미등록'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="text-gray-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">생일 축하 메시지 템플릿</p>
                  <p className="text-gray-900">{getTemplateTitle(profile.birthdayTemplateId)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">소속 부동산 정보</h2>
            {profile.realEstate ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">부동산 이름</p>
                  <p className="text-gray-900">{profile.realEstate.name || '미등록'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">부동산 연락처</p>
                  <p className="text-gray-900">{profile.realEstate.contact || '미등록'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">소속 부동산 정보가 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="프로필 수정"
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
