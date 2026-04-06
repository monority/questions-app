import { useHaptic } from '../../hooks/useHaptic';

interface AnswerOptionsProps {
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  showResult: boolean;
}

export function AnswerOptions({
  options,
  correctAnswer,
  selectedAnswer,
  onAnswer,
  disabled,
  showResult,
}: AnswerOptionsProps) {
  const { trigger } = useHaptic();
  
  const getOptionClass = (option: string) => {
    const classes = ['answer-option'];
    
    if (showResult) {
      if (option === correctAnswer) {
        classes.push('correct');
      } else if (option === selectedAnswer && option !== correctAnswer) {
        classes.push('incorrect');
      }
    } else if (selectedAnswer === option) {
      classes.push('selected');
    }
    
    if (disabled && !showResult) {
      classes.push('disabled');
    }
    
    return classes.join(' ');
  };

  const handleClick = (option: string) => {
    if (disabled) return;
    trigger('light');
    onAnswer(option);
  };

  return (
    <div className="answer-options">
      {options.map((option, index) => (
        <button
          key={index}
          className={getOptionClass(option)}
          onClick={() => handleClick(option)}
          disabled={disabled}
        >
          <span className="option-letter">
            {String.fromCharCode(65 + index)}
          </span>
          <span className="option-text">{option}</span>
          {showResult && option === correctAnswer && (
            <span className="option-icon correct">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
          )}
          {showResult && option === selectedAnswer && option !== correctAnswer && (
            <span className="option-icon incorrect">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
