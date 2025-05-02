// src/pages/auth/ProfileForm.tsx
import React from 'react';
import { AgentDetail, UpdateAgentReqDto } from '../../types/agent';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { updateMyProfile } from '../../api/agent';

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

  const handleSubmit = async () => {
    const updatedProfile: UpdateAgentReqDto = {
      name,
      email,
      contact,
      licenseNumber,
    };

    const response = await updateMyProfile(updatedProfile);
    if (response.success) {
      onSubmit(updatedProfile);
    } else {
      console.error(response.error);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="연락처" value={contact} onChange={(e) => setContact(e.target.value)} />
      <Input
        label="자격증 번호"
        value={licenseNumber}
        onChange={(e) => setLicenseNumber(e.target.value)}
      />
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="button" variant="primary" onClick={handleSubmit}>
          수정
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;
