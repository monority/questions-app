import type { Player } from '../../types/game';
import { PLAYER_SERVICE } from '../../services';

interface FinalResultsProps {
  players: Player[];
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function FinalResults({ players, onPlayAgain, onNewGame }: FinalResultsProps) {
  const sortedPlayers = PLAYER_SERVICE.sortByScore(players);
  const winner = sortedPlayers[0];
  const hasTie = sortedPlayers.filter(p => p.score === winner.score).length > 1;

  const getPlayerStats = (player: Player) => {
    const total = player.answers.length;
    const correct = player.answers.filter(a => a.correct).length;
    const wrong = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, wrong, accuracy };
  };

  return (
    <div className="final-results">
      <div className="results-header">
        <h1>🏆 Résultats Finaux</h1>
        <p>
          {hasTie
            ? 'Égalité parfaite !'
            : `${winner.name} l'emporte !`}
        </p>
      </div>

      <div className="podium">
        {sortedPlayers.slice(0, 3).map((player, index) => (
          <div
            key={player.id}
            className={`podium-place place-${index + 1}`}
            style={{
              '--player-color': player.color.bg,
            } as React.CSSProperties}
          >
            <div className="podium-avatar">
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div className="podium-name">{player.name}</div>
            <div className="podium-score">{player.score} pts</div>
          </div>
        ))}
      </div>

      <div className="results-stats">
        <div className="stat-card">
          <span className="stat-value">
            {PLAYER_SERVICE.getCorrectCount(sortedPlayers[0])}
          </span>
          <span className="stat-label">Meilleur score</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {players.reduce((sum, p) => sum + PLAYER_SERVICE.getCorrectCount(p), 0) / players.length}
          </span>
          <span className="stat-label">Moyenne</span>
        </div>
      </div>

      <div className="player-results-details">
        <h3>Détails par joueur</h3>
        {sortedPlayers.map(player => {
          const stats = getPlayerStats(player);
          return (
            <div key={player.id} className="player-result-card" style={{ borderColor: player.color.bg }}>
              <div className="player-result-header">
                <span className="player-result-name" style={{ color: player.color.bg }}>
                  {player.name}
                </span>
                <span className="player-result-score">{player.score} pts</span>
              </div>
              <div className="player-result-stats">
                <div className="result-stat correct">
                  <span className="result-stat-value">{stats.correct}</span>
                  <span className="result-stat-label">Bonnes</span>
                </div>
                <div className="result-stat wrong">
                  <span className="result-stat-value">{stats.wrong}</span>
                  <span className="result-stat-label">Mauvaises</span>
                </div>
                <div className="result-stat accuracy">
                  <span className="result-stat-value">{stats.accuracy}%</span>
                  <span className="result-stat-label">Précision</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="results-actions">
        <button className="btn-primary" onClick={onPlayAgain}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          Rejouer
        </button>
        <button className="btn-secondary" onClick={onNewGame}>
          Revenir à l'écran d'accueil
        </button>
      </div>
    </div>
  );
}
