import React, { memo } from 'react';
import type { Question } from '../../types/game';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export const QuestionDisplay = memo(function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
}: QuestionDisplayProps) {
  return (
    <div className="question-display animate-fade-in">
      <div className="question-meta">
        <span>Question {questionNumber}/{totalQuestions}</span>
        {question.category && <span>{question.category}</span>}
      </div>
      <p className="question-text">{question.question}</p>
    </div>
  );
});

interface AnswerOptionsProps {
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  showResult: boolean;
}

export const AnswerOptions = memo(function AnswerOptions({
  options,
  correctAnswer,
  selectedAnswer,
  onAnswer,
  disabled,
  showResult,
}: AnswerOptionsProps) {
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="answer-options stagger-children">
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option;
        const isCorrect = option === correctAnswer;
        const showCorrect = showResult && isCorrect;
        const showIncorrect = showResult && isSelected && !isCorrect;

        return (
          <button
            key={index}
            className={`answer-option ${isSelected ? 'selected' : ''} ${showCorrect ? 'correct' : ''} ${showIncorrect ? 'incorrect' : ''} ${showCorrect ? 'correct-glow' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onAnswer(option)}
            disabled={disabled}
          >
            <span className="option-letter">{letters[index]}</span>
            <span className="option-text">{option}</span>
            {showResult && (
              <span className="option-icon">
                {showCorrect && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
                {showIncorrect && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});

interface TimerProps {
  duration: number;
  isPaused: boolean;
}

export const Timer = memo(function Timer({ duration, isPaused }: TimerProps) {
  const progress = isPaused ? 100 : 0;
  const isLow = duration <= 5;

  return (
    <div className={`timer ${isLow ? 'low' : ''}`}>
      <div className="timer-bar">
        <div className="timer-progress" style={{ width: `${progress}%` }} />
      </div>
      <span className="timer-value">{duration}s</span>
    </div>
  );
});

interface ScoreBoardProps {
  players: Array<{ id: string; name: string; score: number; color: { bg: string } }>;
  compact?: boolean;
}

export const ScoreBoard = memo(function ScoreBoard({ players, compact }: ScoreBoardProps) {
  return (
    <div className={`score-board ${compact ? 'compact' : ''}`}>
      {players.map((player) => (
        <div key={player.id} className="score-player" style={{ '--player-color': player.color.bg } as React.CSSProperties}>
          <span className="player-name">{player.name}</span>
          <span className="player-score">{player.score} pts</span>
        </div>
      ))}
    </div>
  );
});