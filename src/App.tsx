import type { Player } from './types/game';
import { SetupScreen } from './components/setup/SetupScreen';
import { GameScreen } from './components/game/GameScreen';
import { FinalResults } from './components/results/FinalResults';
import { HomeScreen } from './components/HomeScreen';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { useGame } from './hooks';
import { usePlayer } from './hooks/usePlayer';
import { useTheme } from './hooks/useTheme';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const game = useGame();
  const { updateStats } = usePlayer();
  const { theme, toggleTheme } = useTheme();
  
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

  const getScreen = () => {
    if (game.phase === 'setup' && game.players.length === 0) {
      return (
        <HomeScreen 
          onStartGame={game.startGame}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      );
    }

    switch (game.phase) {
      case 'final-results':
        return (
          <FinalResults
            players={game.players}
            onPlayAgain={game.restartGame}
            onNewGame={game.resetGame}
          />
        );
      
      case 'playing':
        if (game.questions.length === 0) {
          return <LoadingSpinner message="Chargement des questions..." />;
        }
        return (
          <GameScreen
            players={game.players}
            mode={game.settings?.mode ?? 'solo'}
            questions={game.questions}
            onGameEnd={handleGameEnd}
            onExit={game.resetGame}
          />
        );
      
      default:
        return <SetupScreen onStartGame={game.startGame} />;
    }
  };

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        <motion.div
          key={game.phase === 'playing' ? 'game' : game.phase === 'final-results' ? 'results' : 'home'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {getScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
