import { useState, useCallback } from 'react';
import type { Player } from '../../types/game';
import { GAME_CONFIG } from '../../config';

interface PlayerSetupProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onUpdatePlayer: (id: string, name: string) => void;
}

export function PlayerSetup({ players, onAddPlayer, onRemovePlayer, onUpdatePlayer }: PlayerSetupProps) {
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = useCallback(() => {
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  }, [newPlayerName, onAddPlayer]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddPlayer();
  }, [handleAddPlayer]);

  return (
    <div className="player-setup">
      <div className="section-header">
        <h2>Joueurs</h2>
        <span className="player-count">{players.length}/{GAME_CONFIG.MAX_PLAYERS}</span>
      </div>

      <div className="add-player-form">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nom du joueur..."
          maxLength={20}
          disabled={players.length >= GAME_CONFIG.MAX_PLAYERS}
        />
        <button onClick={handleAddPlayer} disabled={players.length >= GAME_CONFIG.MAX_PLAYERS || !newPlayerName.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <div className="players-grid">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onRemove={() => onRemovePlayer(player.id)}
            onUpdateName={(name) => onUpdatePlayer(player.id, name)}
          />
        ))}
        
        {players.length === 0 && (
          <div className="empty-state">
            <p>Aucun joueur ajouté</p>
            <span>Ajoutez au moins 1 joueur pour commencer</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface PlayerCardProps {
  player: Player;
  onRemove: () => void;
  onUpdateName: (name: string) => void;
}

function PlayerCard({ player, onRemove, onUpdateName }: PlayerCardProps) {
  return (
    <div
      className="player-card"
      style={{ '--player-color': player.color.bg } as React.CSSProperties}
    >
      <div className="player-avatar" style={{ backgroundColor: player.color.bg }}>
        {player.name.charAt(0).toUpperCase()}
      </div>
      <input
        type="text"
        value={player.name}
        onChange={(e) => onUpdateName(e.target.value)}
        maxLength={20}
        className="player-name-input"
      />
      <button
        className="remove-player"
        onClick={onRemove}
        aria-label="Supprimer le joueur"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
