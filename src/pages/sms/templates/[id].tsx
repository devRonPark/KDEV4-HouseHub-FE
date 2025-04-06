'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import Card from '../../../components/ui/Card';
import { useToast } from '../../../context/useToast';
import { getTemplateById, updateTemplate } from '../../../api/smsApi';
import type { CreateUpdateTemplateReqDto } from '../../../types/sms';

const SmsTemplateEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  // 템플릿 상세 정보 조회
  useEffect(() => {
    const fetchTemplateDetail = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const response = await getTemplateById(Number(id));
        if (response.success && response.data) {
          setTitle(response.data.title);
          setContent(response.data.content);
        } else {
          showToast(response.message || '템플릿 정보를 불러오는데 실패했습니다.', 'error');
          navigate('/sms/templates');
        }
      } catch (error) {
        console.error('템플릿 상세 정보 조회 오류:', error);
        showToast('템플릿 정보를 불러오는 중 오류가 발생했습니다.', 'error');
        navigate('/sms/templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplateDetail();
  }, [id, navigate, showToast]);

  // 유효성 검사
  const validateForm = () => {
    const newErrors: { title?: string; content?: string } = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = '템플릿 제목을 입력해주세요.';
      isValid = false;
    }

    if (!content.trim()) {
      newErrors.content = '템플릿 내용을 입력해주세요.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 템플릿 수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) {
      return;
    }

    const templateData: CreateUpdateTemplateReqDto = {
      title: title.trim(),
      content: content.trim(),
    };

    setIsSubmitting(true);
    try {
      const response = await updateTemplate(Number(id), templateData);
      if (response.success) {
        showToast('템플릿이 성공적으로 수정되었습니다.', 'success');
        navigate('/sms/templates');
      } else {
        showToast(response.message || '템플릿 수정에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('템플릿 수정 오류:', error);
      showToast('템플릿 수정 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">문자 템플릿 수정</h1>
        <p className="mt-2 text-sm text-gray-500">
          기존 문자 템플릿을 수정하고 저장할 수 있습니다.
        </p>
      </div>

      <div className="mt-6">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                템플릿 이름
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="템플릿 이름을 입력하세요"
                error={errors.title}
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                템플릿 내용
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="템플릿 내용을 입력하세요"
                rows={8}
                error={errors.content}
                required
              />
              <div className="mt-1 text-sm text-gray-500 flex justify-between">
                <span>{content.length}자</span>
                {content.length > 90 && (
                  <span className="text-blue-500">90자를 초과하는 경우 LMS로 발송됩니다.</span>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => navigate('/sms/templates')}>
                취소
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                저장하기
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SmsTemplateEditPage;
