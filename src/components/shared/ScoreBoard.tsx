import type { Player } from '../../types/game';
import { PLAYER_SERVICE } from '../../services';

interface ScoreBoardProps {
  players: Player[];
  currentPlayerId?: string;
  compact?: boolean;
}

export function ScoreBoard({ players, currentPlayerId, compact }: ScoreBoardProps) {
  const sortedPlayers = PLAYER_SERVICE.sortByScore(players);

  return (
    <div className={`score-board ${compact ? 'compact' : ''}`}>
      {sortedPlayers.map((player, index) => (
        <div
          key={player.id}
          className={`score-player ${currentPlayerId === player.id ? 'current' : ''} rank-${index + 1}`}
          style={{
            '--player-color': player.color.bg,
          } as React.CSSProperties}
        >
          <span className="rank">
            {index === 0 ? '👑' : `#${index + 1}`}
          </span>
          <div className="player-info">
            <span className="player-name">{player.name}</span>
            {!compact && (
              <span className="player-correct">
                {PLAYER_SERVICE.getCorrectCount(player)}/{player.answers.length}
              </span>
            )}
          </div>
          <span className="player-score">{player.score}</span>
          {!compact && (
            <span className="player-total">Total: {player.score}</span>
          )}
        </div>
      ))}
    </div>
  );
}
