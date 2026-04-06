import type { Player } from '../../types/game';

interface PlayerItemProps {
  player: Player;
  onRemove: () => void;
  onEdit?: () => void;
  isEditing?: boolean;
  editingName?: string;
  onNameChange?: (name: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}

export function PlayerItem({
  player,
  onRemove,
  onEdit,
  isEditing,
  editingName,
  onNameChange,
  onSaveEdit,
  onCancelEdit,
}: PlayerItemProps) {
  const isBot = player.name.startsWith('Bot');

  return (
    <div className="player-item added-player">
      <div className="player-avatar" style={{ backgroundColor: player.color.bg }}>
        {player.name.charAt(0).toUpperCase()}
      </div>
      {isEditing ? (
        <input
          type="text"
          className="player-name-input edit-input"
          value={editingName ?? ''}
          onChange={(e) => onNameChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit?.();
            if (e.key === 'Escape') onCancelEdit?.();
          }}
          autoFocus
          maxLength={15}
        />
      ) : (
        <span className="player-name" onDoubleClick={() => !isBot && onEdit?.()}>
          {player.name}
        </span>
      )}
      <span className="player-tag">{isBot ? 'IA' : 'Joueur'}</span>
      <div className="player-actions">
        {!isBot && onEdit && (
          <button className="edit-player-btn" onClick={onEdit} title="Modifier le nom">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
        <button className="remove-player-btn" onClick={onRemove}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

interface PlayerListProps {
  players: Player[];
  onRemovePlayer: (index: number) => void;
  onStartEditing: (playerId: string, name: string) => void;
  editingPlayerId: string | null;
  editingName: string;
  onEditingNameChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

export function PlayerList({
  players,
  onRemovePlayer,
  onStartEditing,
  editingPlayerId,
  editingName,
  onEditingNameChange,
  onSaveEdit,
  onCancelEdit,
}: PlayerListProps) {
  if (players.length === 0) {
    return (
      <p className="no-players-message">Aucun joueur ajouté. Cliquez ci-dessous pour ajouter des joueurs!</p>
    );
  }

  return (
    <div className="player-list">
      {players.map((player, idx) => (
        <PlayerItem
          key={player.id ?? idx}
          player={player}
          onRemove={() => onRemovePlayer(idx)}
          onEdit={() => onStartEditing(player.id, player.name)}
          isEditing={editingPlayerId === player.id}
          editingName={editingName}
          onNameChange={onEditingNameChange}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
        />
      ))}
    </div>
  );
}
