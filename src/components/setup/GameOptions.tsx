import { useState } from 'react';
import { CATEGORIES } from '../../config/constants';
import { GAME_CONFIG } from '../../config';

export function GameOptions() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(GAME_CONFIG.DEFAULT_QUESTION_COUNT);

  return (
    <div className="game-options">
      <h2>Options</h2>
      
      <div className="option-group">
        <label>Catégorie</label>
        <select
          value={selectedCategory ?? ''}
          onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="option-group">
        <label>Nombre de questions</label>
        <div className="question-count-selector">
          {GAME_CONFIG.QUESTION_COUNTS.map((count) => (
            <button
              key={count}
              className={questionCount === count ? 'selected' : ''}
              onClick={() => setQuestionCount(count)}
            >
              {count}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
