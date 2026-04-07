import type { LeaderboardEntry } from '../hooks/useLeaderboard';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onClose: () => void;
}

function getModeLabel(mode: string): string {
  const modes: Record<string, string> = {
    solo: 'Solo',
    party: 'Party',
  };
  return modes[mode] || mode;
}

export function Leaderboard({ entries, onClose }: LeaderboardProps) {
  return (
    <div className="leaderboard-overlay" onClick={onClose}>
      <div className="leaderboard-modal" onClick={e => e.stopPropagation()}>
        <div className="leaderboard-header">
          <h2>🏆 Classement</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="leaderboard-empty">
            <span className="empty-icon">🎮</span>
            <p>Pas encore de scores</p>
            <p className="empty-hint">Joue une partie pour apparaître ici!</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {entries.map((entry, index) => (
              <div key={entry.id} className={`leaderboard-entry rank-${index + 1}`}>
                <div className="entry-rank">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && <span>#{index + 1}</span>}
                </div>
                <div className="entry-info">
                  <span className="entry-name">{entry.name}</span>
                  <span className="entry-meta">
                    {getModeLabel(entry.gameMode)} • Niveau {entry.level}
                  </span>
                </div>
                <div className="entry-score">
                  <span className="score-value">{entry.score}</span>
                  <span className="score-label">pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}