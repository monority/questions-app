import { useState, useCallback } from 'react';
import type { GameMode, GameSettings } from '../../types/game';
import { PlayerSetup } from './PlayerSetup';
import { ModeSelection } from './ModeSelection';
import { GameOptions } from './GameOptions';
import { usePlayers } from '../../hooks';
import { GAME_CONFIG } from '../../config';

interface SetupScreenProps {
  onStartGame: (settings: GameSettings, players: import('../../types/game').Player[]) => void;
}

export function SetupScreen({ onStartGame }: SetupScreenProps) {
  const [mode, setMode] = useState<GameMode>('solo');
  const [isLoading, setIsLoading] = useState(false);
  const { players, addPlayer, removePlayer, updatePlayer, canStart } = usePlayers();

  const handleStart = useCallback(() => {
    if (!canStart) return;
    setIsLoading(true);
    
    onStartGame({
      mode,
      type: players.length > 1 ? 'multiplayer' : 'solo',
      playerCount: players.length,
      questionsPerRound: GAME_CONFIG.DEFAULT_QUESTION_COUNT,
      timePerQuestion: GAME_CONFIG.DEFAULT_TIME_PER_QUESTION,
      categories: [],
      difficulty: 'all',
    }, players);
  }, [canStart, mode, players, onStartGame]);

  return (
    <div className="setup-screen">
      <header className="setup-header">
        <h1>
          <span className="logo-icon">🎯</span>
          Culture Quiz
        </h1>
        <p>Testez vos connaissances en équipe</p>
      </header>

      <div className="setup-content">
        <PlayerSetup
          players={players}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
          onUpdatePlayer={updatePlayer}
        />
        
        <ModeSelection mode={mode} onModeChange={setMode} />

        <GameOptions />
      </div>

      <footer className="setup-footer">
        <button
          className="btn-primary start-btn"
          onClick={handleStart}
          disabled={!canStart || isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" />
              Chargement...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Commencer
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
