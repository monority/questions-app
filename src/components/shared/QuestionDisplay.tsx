import { memo } from 'react';
import type { Question } from '../../types/game';
import { DIFFICULTY_COLORS } from '../../config/constants';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

const DIFFICULTY_MAP: Record<string, keyof typeof DIFFICULTY_COLORS> = {
  'Facile': 'easy',
  'Moyen': 'medium',
  'Difficile': 'hard',
};

export const QuestionDisplay = memo(function QuestionDisplay({ question, questionNumber, totalQuestions }: QuestionDisplayProps) {
  const difficultyKey = DIFFICULTY_MAP[question.difficulty] || question.difficulty;
  
  return (
    <div className="question-display">
      <div className="question-meta">
        <span className="question-number">
          {questionNumber}/{totalQuestions}
        </span>
        <span
          className="question-difficulty"
          style={{ backgroundColor: DIFFICULTY_COLORS[difficultyKey] }}
        >
          {question.difficulty}
        </span>
        <span className="question-category">{question.category}</span>
      </div>
      
      <h2 className="question-text">{question.question}</h2>
    </div>
  );
});
