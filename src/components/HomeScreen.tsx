import React, { useState, useEffect } from 'react';
import type { GameSettings, GameMode, Player } from '../types/game';
import { usePlayer } from '../hooks/usePlayer';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Leaderboard } from './Leaderboard';
import { AddPlayerModal } from './AddPlayerModal';
import { LoadingSpinner } from './shared/LoadingSpinner';

const CATEGORIES = [
  'Géographie', 'Histoire', 'Science', 'Arts', 'Sports', 
  'Culture Générale', 'Célébrités', 'Télévision', 'Gastronomie', 'Jeux Vidéo'
] as const;

const GAME_MODES: { id: GameMode; name: string; description: string; icon: React.ReactNode }[] = [
  { id: 'solo', name: 'Solo', description: 'Testez vos connaissances', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> },
  { id: 'duel', name: 'Duel', description: '1v1 en vitesse', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg> },
  { id: 'party', name: 'Party', description: 'Plusieurs joueurs', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="19" cy="7" r="2"/></svg> },
  { id: 'tournament', name: 'Tournoi', description: 'Elimination progressive', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/><path d="M12 15V3"/><path d="M21 15v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6"/><path d="M18 21a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2h4z"/></svg> },
  { id: 'competitive', name: 'Compétitif', description: 'Le plus rapide marque', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m6.8 14-3.5 2"/><path d="m20.7 16-3.5-2"/><path d="M6.8 10 3.3 8"/><path d="m20.7 8-3.5 2"/><path d="m9 22 3-8 3 8"/><path d="M8 6h8"/></svg> },
  { id: 'cooperative', name: 'Coopératif', description: 'Jouez ensemble', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M12 12v.01"/></svg> },
];

interface HomeScreenProps {
  onStartGame: (settings: GameSettings, players: Player[]) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function HomeScreen({ onStartGame, theme, onToggleTheme }: HomeScreenProps) {
  const { player, isLoading, setPlayerName, getLevelInfo, getBadges } = usePlayer();
  const { entries } = useLeaderboard();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [playerName, setPlayerNameInput] = useState(() => player?.name ?? '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const isMultiplayerMode = ['duel', 'party', 'tournament', 'competitive', 'cooperative'].includes(gameMode);
  const startButtonText = isMultiplayerMode 
    ? (players.length < 2 ? `Ajoutez au moins 2 joueurs (${players.length}/2)` : 'Commencer')
    : 'Commencer';

  useEffect(() => {
    if (!isMultiplayerMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlayers([]);
    }
  }, [isMultiplayerMode]);

  if (isLoading) {
    return <LoadingSpinner message="Chargement du profil..." />;
  }

  const levelInfo = getLevelInfo();
  const badges = getBadges();

  const categories = CATEGORIES;
  const modes = GAME_MODES;

  const handleStart = () => {
    const finalName = playerName || 'Joueur';
    if (playerName !== player?.name) {
      setPlayerName(finalName);
    }

    let finalPlayers: Player[];

    if (isMultiplayerMode) {
      const addedPlayers = players.map((p) => ({
        ...p,
        id: p.id || crypto.randomUUID(),
      }));
      
      if (addedPlayers.length > 0) {
        finalPlayers = addedPlayers;
      } else {
        const humanPlayer: Player = {
          id: player?.id || crypto.randomUUID(),
          name: finalName,
          score: 0,
          xp: player?.xp || 0,
          level: player?.level || 1,
          color: { bg: 'var(--color-accent)', border: 'var(--color-accent-secondary)', name: 'Violet' },
          answers: [],
          streak: 0,
          maxStreak: player?.maxStreak || 0,
          status: 'playing',
          badges: player?.badges || [],
        };
        finalPlayers = [humanPlayer];
      }
    } else {
      finalPlayers = [{
        id: player?.id || crypto.randomUUID(),
        name: finalName,
        score: 0,
        xp: player?.xp || 0,
        level: player?.level || 1,
        color: { bg: '#6366f1', border: '#818cf8', name: 'Violet' },
        answers: [],
        streak: 0,
        maxStreak: player?.maxStreak || 0,
        status: 'playing' as const,
        badges: player?.badges || [],
      }];
    }

    onStartGame({
      mode: gameMode,
      type: isMultiplayerMode ? 'multiplayer' : 'solo',
      playerCount: finalPlayers.length,
      questionsPerRound: questionCount,
      timePerQuestion: 20,
      categories: selectedCategories,
      difficulty: 'all',
    }, finalPlayers);
  };

  const addBot = () => {
    const botNames = ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 'Bot Epsilon', 'Bot Zeta'];
    const botColors = [
      { bg: '#ef4444', border: '#f87171', name: 'Rouge' },
      { bg: '#f59e0b', border: '#fbbf24', name: 'Orange' },
      { bg: '#10b981', border: '#34d399', name: 'Vert' },
      { bg: '#3b82f6', border: '#60a5fa', name: 'Bleu' },
      { bg: '#8b5cf6', border: '#a78bfa', name: 'Violet' },
      { bg: '#ec4899', border: '#f472b6', name: 'Rose' },
    ];
    const newBot: Player = {
      id: crypto.randomUUID(),
      name: botNames[players.length] || `Bot ${players.length + 1}`,
      score: 0,
      xp: 0,
      level: 1,
      color: botColors[players.length % botColors.length],
      answers: [],
      streak: 0,
      maxStreak: 0,
      status: 'playing',
      badges: [],
    };
    setPlayers([...players, newBot]);
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const startEditingName = (playerId: string, currentName: string) => {
    setEditingPlayerId(playerId);
    setEditingName(currentName);
  };

  const saveEditingName = () => {
    if (editingPlayerId && editingName.trim()) {
      setPlayers(players.map(p => 
        p.id === editingPlayerId ? { ...p, name: editingName.trim() } : p
      ));
    }
    setEditingPlayerId(null);
    setEditingName('');
  };

  const cancelEditingName = () => {
    setEditingPlayerId(null);
    setEditingName('');
  };

  return (
    <div className="home-screen">
      <header className="home-header">
        <button className="theme-toggle" onClick={onToggleTheme} aria-label="Changer le theme">
          {theme === 'dark' 
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
        <h1>
          <span className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
          </span>
          Culture Quiz
        </h1>
        <p className="tagline">Testez vos connaissances en francais</p>
      </header>

      <main className="home-content">
        <section className="mode-selection">
          <h2>Choisissez votre mode</h2>
          <div className="mode-grid">
            {modes.map(mode => (
              <button
                key={mode.id}
                className={`mode-card ${gameMode === mode.id ? 'selected' : ''}`}
                onClick={() => setGameMode(mode.id)}
              >
                <span className="mode-icon">{mode.icon}</span>
                <span className="mode-name">{mode.name}</span>
                <span className="mode-desc">{mode.description}</span>
              </button>
            ))}
          </div>
        </section>

        {isMultiplayerMode && (
          <section className="multiplayer-setup">
            <h2>Joueurs</h2>
            <div className="player-list">
              {players.length === 0 ? (
                <p className="no-players-message">Aucun joueur ajouté. Cliquez ci-dessous pour ajouter des joueurs!</p>
              ) : (
                players.map((p, idx) => {
                  const isBot = p.name.startsWith('Bot');
                  const isEditing = editingPlayerId === p.id;
                  return (
                    <div key={p.id} className="player-item added-player">
                      <div className="player-avatar" style={{ backgroundColor: p.color.bg }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    {isEditing ? (
                      <input
                        type="text"
                        className="player-name-input edit-input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditingName();
                          if (e.key === 'Escape') cancelEditingName();
                        }}
                        autoFocus
                        maxLength={15}
                      />
                    ) : (
                      <span className="player-name" onDoubleClick={() => !isBot && startEditingName(p.id, p.name)}>
                        {p.name}
                      </span>
                    )}
                    <span className="player-tag">{isBot ? 'IA' : 'Joueur'}</span>
                    <div className="player-actions">
                      {!isBot && (
                        <button 
                          className="edit-player-btn" 
                          onClick={() => startEditingName(p.id, p.name)}
                          title="Modifier le nom"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                      )}
                      <button className="remove-player-btn" onClick={() => removePlayer(idx)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
              )}
            </div>
            <div className="add-player-buttons">
              <button className="add-bot-btn" onClick={() => setShowAddPlayerModal(true)} disabled={players.length >= 5}>
                + Ajouter un joueur
              </button>
              <button className="add-bot-btn" onClick={addBot} disabled={players.length >= 5}>
                + Ajouter un bot
              </button>
            </div>
            <p className="player-hint">
              {gameMode === 'duel' && 'Défiez jusqu\'à 5 bots en mode compétitif!'}
              {gameMode === 'party' && 'Partagez votre écran pour jouer ensemble!'}
              {gameMode === 'tournament' && 'Affrontez jusqu\'à 6 joueurs en élimination!'}
              {gameMode === 'competitive' && 'Le plus rapide marque plus de points!'}
              {gameMode === 'cooperative' && 'Tous les joueurs répondent à tour de rôle'}
            </p>
            </section>
          )}

          <section className="player-setup-home">
            <h2>Votre profil</h2>
            <>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                placeholder="Entrez votre pseudo..."
                maxLength={15}
                className="player-name-input"
              />
              {player && (
                <div className="player-preview">
                  <div className="player-avatar" style={{ backgroundColor: player.color.bg }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="player-stats">
                    <span className="player-level">Niveau {player.level}</span>
                    <span className="player-title">{levelInfo?.title || 'Novice'}</span>
                    <span className="player-xp">XP: {player.xp}</span>
                  </div>
                  {levelInfo && (
                    <div className="xp-progress-bar">
                      <div className="xp-progress-fill" style={{ width: `${levelInfo.progress}%` }}></div>
                    </div>
                  )}
                </div>
              )}
              {badges.length > 0 && (
                <div className="player-badges">
                  {badges.map(badge => (
                    <span key={badge.id} className="badge-item" title={badge.description}>
                      {badge.icon}
                    </span>
                  ))}
                </div>
              )}
            </>
        </section>

        <section className="game-options-home">
          <h2>Options</h2>
          
          <div className="option-group">
            <label>Nombre de questions: {questionCount}</label>
            <input
              type="range"
              min="5"
              max="20"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="range-slider"
            />
          </div>

          <div className="option-group">
            <label>Catégories</label>
            <div className="category-tags">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-tag ${selectedCategories.includes(cat) ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCategories(prev => 
                      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                    );
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <button 
          className="btn-primary start-btn-large" 
          onClick={() => {
            if (isMultiplayerMode && players.length < 2) {
              setShowAddPlayerModal(true);
            } else {
              handleStart();
            }
          }}
        >
          <span>{startButtonText}</span>
          <span className="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </span>
        </button>
      </main>

      <footer className="home-footer">
        <div className="stats-preview">
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> 2250+ questions</span>
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> 8 badges</span>
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> 10 niveaux</span>
        </div>
        <button className="leaderboard-btn" onClick={() => setShowLeaderboard(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          Classement
        </button>
      </footer>

      {showLeaderboard && (
        <Leaderboard entries={entries} onClose={() => setShowLeaderboard(false)} />
      )}

      <AddPlayerModal
        isOpen={showAddPlayerModal}
        onClose={() => setShowAddPlayerModal(false)}
        onAdd={(name, color) => {
          const newPlayer: Player = {
            id: crypto.randomUUID(),
            name,
            score: 0,
            xp: 0,
            level: 1,
            color,
            answers: [],
            streak: 0,
            maxStreak: 0,
            status: 'playing',
            badges: [],
          };
          setPlayers([...players, newPlayer]);
        }}
      />
    </div>
  );
}
