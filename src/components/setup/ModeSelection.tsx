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
          className={`mode-card ${mode === 'solo' ? 'selected' : ''}`}
          onClick={() => onModeChange('solo')}
        >
          <div className="mode-icon solo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
          </div>
          <h3>Solo</h3>
          <p>Testez vos connaissances</p>
          <div className="mode-features">
            <span>+10 pts bonne réponse</span>
          </div>
        </button>

        <button
          className={`mode-card ${mode === 'party' ? 'selected' : ''}`}
          onClick={() => onModeChange('party')}
        >
          <div className="mode-icon party">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3>Party</h3>
          <p>Plusieurs joueurs</p>
          <div className="mode-features">
            <span>+10 pts bonne réponse</span>
            <span>Question différente par joueur</span>
          </div>
        </button>
      </div>
    </div>
  );
}