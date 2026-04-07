import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameSettings, GameMode, Player } from '../types/game';
import { usePlayer } from '../hooks/usePlayer';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useAuth } from '../hooks/useAuth';
import { useUserSearch } from '../hooks/useGlobalLeaderboard';
import { Leaderboard } from './Leaderboard';
import { AddPlayerModal } from './AddPlayerModal';
import { LoginModal } from './LoginModal';
import { UserSearch } from './UserSearch';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { ModeCard } from './shared/ModeCard';
import { PlayerList } from './shared/PlayerList';
import { CategorySelector } from './shared/CategorySelector';
import { QuestionCountSelector } from './shared/QuestionCountSelector';
import { GAME_MODES, isMultiplayerMode, BOT_NAMES, BOT_COLORS } from '../config';

interface HomeScreenProps {
  onStartGame: (settings: GameSettings, players: Player[]) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function HomeScreen({ onStartGame, theme, onToggleTheme }: HomeScreenProps) {
  const { player, isLoading, setPlayerName } = usePlayer();
  const { user, profile, signOut } = useAuth();
  const { entries } = useLeaderboard();
  const search = useUserSearch();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [playerName] = useState(() => profile?.username ?? player?.name ?? '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const isMulti = isMultiplayerMode(gameMode);

  if (isLoading) {
    return <LoadingSpinner message="Chargement du profil..." />;
  }

  const getStartButtonText = () => {
    if (isMulti) {
      return players.length < 2 
        ? `Ajoutez au moins 2 joueurs (${players.length}/2)` 
        : 'Commencer';
    }
    return 'Commencer';
  };

  const handleStart = () => {
    const finalName = playerName || 'Joueur';
    if (playerName !== player?.name) {
      setPlayerName(finalName);
    }

    let finalPlayers: Player[];

    if (isMulti) {
      const addedPlayers = players.map((p) => ({
        ...p,
        id: p.id || crypto.randomUUID(),
      }));
      
      if (addedPlayers.length > 0) {
        finalPlayers = addedPlayers;
      } else {
        finalPlayers = [createHumanPlayer(finalName)];
      }
    } else {
      finalPlayers = [createHumanPlayer(finalName)];
    }

    onStartGame({
      mode: gameMode,
      type: isMulti ? 'multiplayer' : 'solo',
      playerCount: finalPlayers.length,
      questionsPerRound: questionCount,
      timePerQuestion: 20,
      categories: selectedCategories,
      difficulty: 'all',
    }, finalPlayers);
  };

  const createHumanPlayer = (name: string): Player => ({
    id: player?.id || crypto.randomUUID(),
    name,
    score: 0,
    xp: player?.xp || 0,
    level: player?.level || 1,
    color: player?.color || { bg: '#6366f1', border: '#818cf8', name: 'Violet' },
    answers: [],
    streak: 0,
    maxStreak: player?.maxStreak || 0,
    status: 'playing',
    badges: player?.badges || [],
  });

  const addBot = () => {
    const newBot: Player = {
      id: crypto.randomUUID(),
      name: BOT_NAMES[players.length] || `Bot ${players.length + 1}`,
      score: 0,
      xp: 0,
      level: 1,
      color: BOT_COLORS[players.length % BOT_COLORS.length],
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

  const handleStartClick = () => {
    if (isMulti && players.length < 2) {
      setShowAddPlayerModal(true);
    } else {
      handleStart();
    }
  };

  return (
    <div className="home-screen">
      <header className="home-header">
        <div className="header-left">
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
        </div>
        
        <div className="header-actions">
          <button 
            className="header-btn leaderboard-btn" 
            onClick={() => setShowUserSearch(true)}
            title="Rechercher un joueur"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          
          <button 
            className="header-btn leaderboard-btn" 
            onClick={() => setShowLeaderboard(true)}
            title="Classement global"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
          </button>
          
          {user ? (
            <div className="user-menu">
              <button 
                className="user-profile-btn" 
                onClick={() => {
                  if (profile) {
                    search.setSelectedUser({
                      id: profile.id,
                      username: profile.username,
                      score: profile.totalScore,
                      createdAt: profile.createdAt,
                    });
                    setShowUserSearch(true);
                  }
                }}
                title="Voir mon profil"
              >
                <span className="user-name">{profile?.username || user.email?.split('@')[0]}</span>
              </button>
              <button onClick={signOut} className="header-btn logout-btn" title="Déconnexion">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
              </button>
            </div>
          ) : (
            <button className="header-btn login-btn" onClick={() => setShowLoginModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
              </svg>
              <span>Connexion</span>
            </button>
          )}
          
          <button className="theme-toggle" onClick={onToggleTheme} aria-label="Changer le theme">
            {theme === 'dark' 
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        </div>
      </header>

      <p className="tagline">Testez vos connaissances en francais</p>

      <main className="home-content">
        <section className="mode-selection">
          <h2>Choisissez votre mode</h2>
          <div className="mode-grid">
            {GAME_MODES.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ width: '100%' }}
              >
                <ModeCard
                  {...mode}
                  isSelected={gameMode === mode.id}
                  onClick={() => setGameMode(mode.id)}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {isMulti && (
          <section className="multiplayer-setup">
            <h2>Joueurs</h2>
            <PlayerList
              players={players}
              onRemovePlayer={removePlayer}
              onStartEditing={startEditingName}
              editingPlayerId={editingPlayerId}
              editingName={editingName}
              onEditingNameChange={setEditingName}
              onSaveEdit={saveEditingName}
              onCancelEdit={cancelEditingName}
            />
            <div className="add-player-buttons">
              <button 
                className="add-bot-btn" 
                onClick={() => setShowAddPlayerModal(true)}
                disabled={players.length >= 5}
              >
                + Ajouter un joueur
              </button>
              <button 
                className="add-bot-btn" 
                onClick={addBot}
                disabled={players.length >= 5}
              >
                + Ajouter un bot
              </button>
            </div>
            <p className="player-hint">
              {gameMode === 'party' && 'Partagez votre écran pour jouer ensemble!'}
            </p>
          </section>
        )}

        <section className="game-options-home">
          <h2>Options</h2>
          
          <div className="option-group">
            <QuestionCountSelector value={questionCount} onChange={setQuestionCount} />
          </div>

          <div className="option-group">
            <label>Catégories</label>
            <CategorySelector 
              selectedCategories={selectedCategories} 
              onCategoryChange={setSelectedCategories} 
            />
          </div>
        </section>

        <button className="btn-primary start-btn-large" onClick={handleStartClick}>
          <span>{getStartButtonText()}</span>
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

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {showUserSearch && (
        <UserSearch 
          query={search.query}
          setQuery={search.setQuery}
          results={search.results}
          loading={search.loading}
          selectedUser={search.selectedUser}
          onSelectUser={(user) => search.setSelectedUser(user)}
          onClose={() => setShowUserSearch(false)}
        />
      )}
    </div>
  );
}
