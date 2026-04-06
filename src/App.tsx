import { useState, useEffect } from 'react';
import type { Player } from './types/game';
import { SetupScreen } from './components/setup/SetupScreen';
import { GameScreen } from './components/game/GameScreen';
import { FinalResults } from './components/results/FinalResults';
import { HomeScreen } from './components/HomeScreen';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { useGame } from './hooks';
import { usePlayer } from './hooks/usePlayer';

function App() {
  const game = useGame();
  const { updateStats } = usePlayer();
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleGameEnd = (players: Player[]) => {
    const mainPlayer = players[0];
    if (mainPlayer) {
      const earnedBadges = updateStats(mainPlayer.answers.map(a => ({
        correct: a.correct,
        timeMs: a.timeMs,
        points: a.points,
      })));
      
      if (earnedBadges.length > 0) {
        setTimeout(() => {
          alert(`🎉 Félicitations! Vous avez débloqué ${earnedBadges.length} nouveau(x) badge(s)!`);
        }, 500);
      }
    }
    game.endGame(players);
  };

  if (game.phase === 'setup' && game.players.length === 0) {
    return (
      <div className="app">
        <HomeScreen 
          onStartGame={game.startGame}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>
    );
  }

  switch (game.phase) {
    case 'final-results':
      return (
        <div className="app final-results-screen">
          <FinalResults
            players={game.players}
            onPlayAgain={game.restartGame}
            onNewGame={game.resetGame}
          />
        </div>
      );
    
    case 'playing':
      if (game.questions.length === 0) {
        return (
          <div className="app">
            <LoadingSpinner message="Chargement des questions..." />
          </div>
        );
      }
      return (
        <div className="app game-screen-wrapper">
          <GameScreen
            players={game.players}
            mode={game.settings?.mode ?? 'competitive'}
            questions={game.questions}
            onGameEnd={handleGameEnd}
            onExit={game.resetGame}
          />
        </div>
      );
    
    default:
      return (
        <div className="app">
          <SetupScreen onStartGame={game.startGame} />
        </div>
      );
  }
}

export default App;
