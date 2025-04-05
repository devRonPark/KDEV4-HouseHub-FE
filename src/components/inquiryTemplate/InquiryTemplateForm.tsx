'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import type { InquiryTemplate, InquiryTemplateRequest } from '../../types/inquiryTemplate';

// 문의 템플릿 폼 유효성 검증 스키마
const inquiryTemplateSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.').max(100, '이름은 100자 이내로 입력해주세요.'),
  description: z.string().min(1, '설명을 입력해주세요.'),
  isActive: z.boolean().default(true),
});

type InquiryTemplateFormData = z.infer<typeof inquiryTemplateSchema>;

interface InquiryTemplateFormProps {
  inquiryTemplate?: InquiryTemplate;
  onSubmit: (data: InquiryTemplateRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const InquiryTemplateForm: React.FC<InquiryTemplateFormProps> = ({
  inquiryTemplate,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [editorContent, setEditorContent] = useState(inquiryTemplate?.description || '');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image,
      TextStyle,
      Color,
    ],
    content: inquiryTemplate?.description || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEditorContent(html);
      setValue('description', html);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<InquiryTemplateFormData>({
    resolver: zodResolver(inquiryTemplateSchema),
    defaultValues: {
      name: inquiryTemplate?.name || '',
      description: inquiryTemplate?.description || '',
      isActive: inquiryTemplate?.isActive ?? true,
    },
  });

  const handleFormSubmit = async (data: InquiryTemplateFormData) => {
    await onSubmit(data);
  };

  // 템플릿 데이터가 변경되면 폼과 에디터 초기화
  useEffect(() => {
    if (inquiryTemplate) {
      reset({
        name: inquiryTemplate.name,
        description: inquiryTemplate.description,
        isActive: inquiryTemplate.isActive,
      });

      if (editor) {
        editor.commands.setContent(inquiryTemplate.description);
      }
    } else {
      reset({
        name: '',
        description: '',
        isActive: true,
      });

      if (editor) {
        editor.commands.setContent('');
      }
    }
  }, [inquiryTemplate, reset, editor]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="문의 템플릿 이름"
              placeholder="문의 템플릿 이름을 입력하세요"
              error={errors.name?.message}
              required
            />
          )}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            문의 템플릿 설명 <span className="text-red-500">*</span>
          </label>

          {/* TipTap 에디터 툴바 */}
          <div className="border border-gray-300 rounded-t-md bg-gray-50 p-2 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-1 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              title="굵게"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="w-5 h-5"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-1 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              title="기울임"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="w-5 h-5"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`p-1 rounded ${editor?.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              title="밑줄"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="w-5 h-5"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M8 3v9a4 4 0 1 0 8 0V3h2v9a6 6 0 1 1-12 0V3h2zM4 20h16v2H4v-2z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={`p-1 rounded ${editor?.isActive('strike') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              title="취소선"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="w-5 h-5"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M17.154 14c.23.516.346 1.09.346 1.72 0 1.342-.524 2.392-1.571 3.147C14.88 19.622 13.433 20 11.586 20c-1.64 0-3.263-.381-4.87-1.144V16.6c1.52.877 3.075 1.316 4.666 1.316 2.551 0 3.83-.732 3.839-2.197a2.21 2.21 0 0 0-.648-1.603l-.12-.117H3v-2h18v2h-3.846zm-4.078-3H7.629a4.086 4.086 0 0 1-.481-.522C6.716 9.92 6.5 9.246 6.5 8.452c0-1.236.466-2.287 1.397-3.153C8.83 4.433 10.271 4 12.222 4c1.471 0 2.879.328 4.222.984v2.152c-1.2-.687-2.515-1.03-3.946-1.03-2.48 0-3.719.782-3.719 2.346 0 .42.218.786.654 1.099.436.313.974.562 1.613.75.62.18 1.297.414 2.03.699z" />
              </svg>
            </button>

            <div className="border-r border-gray-300 mx-1 h-6"></div>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              title="제목 1"
            >
              <span className="font-bold">H1</span>
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              title="제목 2"
            >
              <span className="font-bold">H2</span>
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-1 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              title="제목 3"
            >
              <span className="font-bold">H3</span>
            </button>

            <div className="border-r border-gray-300 mx-1 h-6"></div>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              title="글머리 기호"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="w-5 h-5"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`p-1 rounded ${editor?.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              title="번호 매기기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="w-5 h-5"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zm-2 9h3v1h1v2H6v1H3v-1h2v-1H3v-2zm2 9v-1h1v-1H3v1h2v2H3v1h3v-1h1v-1H5zm5-15h13v2H8v-2zm0 7h13v2H8v-2zm0 7h13v2H8v-2z" />
              </svg>
            </button>

            <div className="border-r border-gray-300 mx-1 h-6"></div>

            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              className={`p-1 rounded ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              title="왼쪽 정렬"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="w-5 h-5"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M3 4h18v2H3V4zm0 15h14v2H3v-2zm0-5h18v2H3v-2zm0-5h14v2H3V9z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              className={`p-1 rounded ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              title="가운데 정렬"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="w-5 h-5"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M3 4h18v2H3V4zm2 15h14v2H5v-2zm-2-5h18v2H3v-2zm2-5h14v2H5V9z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
              className={`p-1 rounded ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              title="오른쪽 정렬"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="w-5 h-5"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M3 4h18v2H3V4zm4 15h14v2H7v-2zm-4-5h18v2H3v-2zm4-5h14v2H7V9z" />
              </svg>
            </button>
          </div>

          {/* TipTap 에디터 콘텐츠 영역 */}
          <div className="border border-gray-300 rounded-b-md p-4 min-h-[200px] bg-white">
            <EditorContent editor={editor} className="prose max-w-none" />
          </div>

          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <Controller
          name="isActive"
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <Checkbox
              {...field}
              id="isActive"
              label="문의 템플릿 활성화"
              checked={value}
              onChange={onChange}
              helperText="활성화된 문의 템플릿만 문의 폼에서 선택할 수 있습니다."
            />
          )}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {inquiryTemplate ? '문의 템플릿 수정' : '문의 템플릿 생성'}
        </Button>
      </div>
    </form>
  );
};

export default InquiryTemplateForm;
