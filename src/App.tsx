import { lazy, Suspense, useState } from 'react';
import { useGame } from './hooks';
import { usePlayer } from './hooks/usePlayer';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { AUTH_SERVICE } from './services/authService';
import { SECURITY_SERVICE } from './services/securityService';
import type { Player } from './types/game';
import { ErrorBoundary } from './components/ErrorBoundary';

const HomeScreen = lazy(() => import('./components/HomeScreen').then(m => ({ default: m.HomeScreen })));
const GameScreen = lazy(() => import('./components/game/GameScreen').then(m => ({ default: m.GameScreen })));
const FinalResults = lazy(() => import('./components/results/FinalResults').then(m => ({ default: m.FinalResults })));
const SetupScreen = lazy(() => import('./components/setup/SetupScreen').then(m => ({ default: m.SetupScreen })));

function LoadingScreen({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          border: '3px solid var(--border)', 
          borderTopColor: 'var(--accent)', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p>{message}</p>
      </div>
    </div>
  );
}

function App() {
  const game = useGame();
  const { updateStats } = usePlayer();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  
  const handleGameEnd = async (players: Player[]) => {
    const mainPlayer = players[0];
    if (mainPlayer) {
      const validatedAnswers = mainPlayer.answers.map(a => ({
        correct: a.correct,
        timeMs: SECURITY_SERVICE.validateTimeMs(a.timeMs),
        points: SECURITY_SERVICE.validateScore(a.points),
      }));
      
      const earnedBadges = updateStats(validatedAnswers);
      
      if (user && profile && !isSubmittingScore) {
        if (SECURITY_SERVICE.isRateLimited('submitScore')) {
          SECURITY_SERVICE.logSecurityEvent('rate_limited', { action: 'submitScore' });
          showToast('Veuillez patienter avant de soumettre à nouveau', 'error');
          game.endGame(players);
          return;
        }
        
        const validatedScore = SECURITY_SERVICE.validateScore(mainPlayer.score);
        setIsSubmittingScore(true);
        try {
          await AUTH_SERVICE.submitScore(user.id, validatedScore, profile.username);
          await refreshProfile();
        } catch (err) {
          console.error('Failed to submit score:', err);
        } finally {
          setIsSubmittingScore(false);
        }
      }
      
      if (earnedBadges.length > 0) {
        setTimeout(() => {
          showToast(`🎉 Félicitations! Vous avez débloqué ${earnedBadges.length} nouveau(x) badge(s)!`, 'badge');
        }, 500);
      }
    }
    game.endGame(players);
  };

  const getScreen = () => {
    if (game.phase === 'setup' && game.players.length === 0) {
      return (
        <Suspense fallback={<LoadingScreen />}>
          <HomeScreen 
            onStartGame={game.startGame}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </Suspense>
      );
    }

    switch (game.phase) {
      case 'final-results':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <div className="final-results-screen">
              <FinalResults
                players={game.players}
                onPlayAgain={game.restartGame}
                onNewGame={game.resetGame}
              />
            </div>
          </Suspense>
        );
      
      case 'playing':
        if (game.questions.length === 0) {
          return <LoadingScreen message="Chargement des questions..." />;
        }
        return (
          <Suspense fallback={<LoadingScreen />}>
            <GameScreen
              players={game.players}
              mode={game.settings?.mode ?? 'solo'}
              questions={game.questions}
              onGameEnd={handleGameEnd}
              onExit={game.resetGame}
            />
          </Suspense>
        );
      
      default:
        return (
          <Suspense fallback={<LoadingScreen />}>
            <SetupScreen onStartGame={game.startGame} />
          </Suspense>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="app">
        {getScreen()}
      </div>
    </ErrorBoundary>
  );
}

export default App;