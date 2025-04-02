import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import { Save, ArrowRight } from 'react-feather';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'danger', 'success', 'text'],
      description: '버튼 스타일 변형',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '버튼 크기',
    },
    fullWidth: {
      control: 'boolean',
      description: '버튼이 부모 컨테이너의 전체 너비를 차지할지 여부',
    },
    isLoading: {
      control: 'boolean',
      description: '로딩 상태 표시 여부',
    },
    leftIcon: {
      control: { disable: true },
      description: '버튼 텍스트 왼쪽에 표시할 아이콘',
    },
    rightIcon: {
      control: { disable: true },
      description: '버튼 텍스트 오른쪽에 표시할 아이콘',
    },
    disabled: {
      control: 'boolean',
      description: '버튼 비활성화 여부',
    },
    onClick: {
      action: 'clicked',
      description: '클릭 이벤트 핸들러',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: '버튼',
    variant: 'primary',
    size: 'md',
    fullWidth: false,
    isLoading: false,
    disabled: false,
  },
};

export const Secondary: Story = {
  args: {
    ...Default.args,
    variant: 'secondary',
    children: '보조 버튼',
  },
};

export const Outline: Story = {
  args: {
    ...Default.args,
    variant: 'outline',
    children: '아웃라인 버튼',
  },
};

export const Danger: Story = {
  args: {
    ...Default.args,
    variant: 'danger',
    children: '삭제',
  },
};

export const Success: Story = {
  args: {
    ...Default.args,
    variant: 'success',
    children: '저장',
  },
};

export const Text: Story = {
  args: {
    ...Default.args,
    variant: 'text',
    children: '텍스트 버튼',
  },
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: 'sm',
    children: '작은 버튼',
  },
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
    children: '큰 버튼',
  },
};

export const FullWidth: Story = {
  args: {
    ...Default.args,
    fullWidth: true,
    children: '전체 너비 버튼',
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
    children: '로딩 중...',
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
    children: '비활성화 버튼',
  },
};

export const WithLeftIcon: Story = {
  args: {
    ...Default.args,
    leftIcon: <Save size={16} />,
    children: '저장',
  },
};

export const WithRightIcon: Story = {
  args: {
    ...Default.args,
    rightIcon: <ArrowRight size={16} />,
    children: '다음',
  },
};
