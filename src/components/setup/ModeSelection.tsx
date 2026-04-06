import type { GameMode } from '../../types/game';

interface ModeSelectionProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export function ModeSelection({ mode, onModeChange }: ModeSelectionProps) {
  return (
    <div className="mode-selection">
      <h2>Mode de jeu</h2>
      
      <div className="mode-cards">
        <button
          className={`mode-card ${mode === 'competitive' ? 'selected' : ''}`}
          onClick={() => onModeChange('competitive')}
        >
          <div className="mode-icon competitive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h3>Compétitif</h3>
          <p>Le premier à répondre gagne des points bonus</p>
          <div className="mode-features">
            <span>+10 pts bonne réponse</span>
            <span>+5 pts réponse rapide</span>
          </div>
        </button>

        <button
          className={`mode-card ${mode === 'cooperative' ? 'selected' : ''}`}
          onClick={() => onModeChange('cooperative')}
        >
          <div className="mode-icon cooperative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
            </svg>
          </div>
          <h3>Coopératif</h3>
          <p>Tout le monde répond, comparez vos réponses</p>
          <div className="mode-features">
            <span>+10 pts bonne réponse</span>
            <span>Pas de pénalité</span>
          </div>
        </button>
      </div>
    </div>
  );
}
