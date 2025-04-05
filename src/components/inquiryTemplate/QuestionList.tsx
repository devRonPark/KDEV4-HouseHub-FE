'use client';

import type React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import type { Question } from '../../types/inquiryTemplate';

interface QuestionListProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onQuestionsChange,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 앤 드롭 처리
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      const updatedQuestions = arrayMove(questions, oldIndex, newIndex).map((item, index) => ({
        ...item,
        questionOrder: index + 1,
      }));

      onQuestionsChange(updatedQuestions);
    }
  };

  // 위로 이동
  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const updatedQuestions = arrayMove(questions, index, index - 1).map((item, idx) => ({
      ...item,
      questionOrder: idx + 1,
    }));

    onQuestionsChange(updatedQuestions);
  };

  // 아래로 이동
  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return;

    const updatedQuestions = arrayMove(questions, index, index + 1).map((item, idx) => ({
      ...item,
      questionOrder: idx + 1,
    }));

    onQuestionsChange(updatedQuestions);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">질문이 없습니다. 질문을 추가해주세요.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {questions.map((question, index) => (
            <SortableItem
              key={question.id}
              id={question.id}
              question={question}
              index={index}
              isFirst={index === 0}
              isLast={index === questions.length - 1}
              onEdit={onEditQuestion}
              onDelete={onDeleteQuestion}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default QuestionList;
