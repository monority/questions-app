import { GAME_CONFIG } from '../../config';

interface QuestionCountSelectorProps {
  value: number;
  onChange: (count: number) => void;
}

export function QuestionCountSelector({ value, onChange }: QuestionCountSelectorProps) {
  return (
    <>
      <label>Nombre de questions: {value}</label>
      <input
        type="range"
        min={Math.min(...GAME_CONFIG.QUESTION_COUNTS)}
        max={Math.max(...GAME_CONFIG.QUESTION_COUNTS)}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-slider"
      />
    </>
  );
}
