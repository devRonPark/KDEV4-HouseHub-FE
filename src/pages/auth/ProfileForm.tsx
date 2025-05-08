// src/pages/auth/ProfileForm.tsx
import React, { useEffect, useState } from 'react';
import { AgentDetail, UpdateAgentReqDto } from '../../types/agent';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { updateMyProfile } from '../../api/agent';
import Select from '../../components/ui/Select';
import { getAllTemplates } from '../../api/sms';
import type { TemplateResDto } from '../../types/sms';

interface ProfileFormProps {
  initialData: AgentDetail | null;
  onSubmit: (data: UpdateAgentReqDto) => void;
  onCancel: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [name, setName] = React.useState(initialData?.name || '');
  const [email, setEmail] = React.useState(initialData?.email || '');
  const [contact, setContact] = React.useState(initialData?.contact || '');
  const [licenseNumber, setLicenseNumber] = React.useState(initialData?.licenseNumber || '');
  const [birthdayTemplateId, setBirthdayTemplateId] = React.useState(
    initialData?.birthdayTemplateId || ''
  );
  const [templates, setTemplates] = useState<TemplateResDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await getAllTemplates({
          page: 1,
          size: 100,
          keyword: '',
        });

        if (response.success && response.data) {
          setTemplates(response.data.content || []);
        }
      } catch (error) {
        console.error('템플릿 목록 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSubmit = async () => {
    const updatedProfile: UpdateAgentReqDto = {
      name,
      email,
      contact,
      licenseNumber,
      birthdayTemplateId: birthdayTemplateId || undefined,
    };

    const response = await updateMyProfile(updatedProfile);
    if (response.success) {
      onSubmit(updatedProfile);
    } else {
      console.error(response.error);
    }
  };

  const templateOptions = [
    { value: '', label: '선택 안 함' },
    ...templates.map((template) => ({
      value: template.id.toString(),
      label: template.title,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <Input
          label="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
        />
        <Input
          label="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일을 입력하세요"
          type="email"
        />
        <Input
          label="연락처"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="연락처를 입력하세요"
        />
        <Input
          label="자격증 번호"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          placeholder="자격증 번호를 입력하세요"
        />
        <Select
          label="생일 축하 메시지 템플릿"
          value={birthdayTemplateId}
          onChange={(value) => setBirthdayTemplateId(value)}
          options={templateOptions}
          isLoading={isLoading}
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="button" variant="primary" onClick={handleSubmit}>
          저장
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;
