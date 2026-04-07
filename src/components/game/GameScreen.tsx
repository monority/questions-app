import { useState, useCallback, useRef, useMemo } from 'react';
import type { Player, Question, GameMode } from '../../types/game';
import { QuestionDisplay } from '../shared/QuestionDisplay';
import { AnswerOptions } from '../shared/AnswerOptions';
import { Timer } from '../shared/Timer';
import { ScoreBoard } from '../shared/ScoreBoard';
import { GAME_CONFIG, MODE_CONFIG } from '../../config';

interface GameScreenProps {
  players: Player[];
  mode: GameMode;
  questions: Question[];
  onGameEnd: (players: Player[]) => void;
  onExit: () => void;
}

interface GameState {
  currentQuestionIndex: number | null;
  currentPlayerIndex: number;
  selectedAnswer: string | null;
  showResult: boolean;
  isPaused: boolean;
}

const initialGameState: GameState = {
  currentQuestionIndex: 0,
  currentPlayerIndex: 0,
  selectedAnswer: null,
  showResult: false,
  isPaused: false,
};

export function GameScreen({ players: initialPlayers, mode, questions, onGameEnd, onExit }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [gamePlayers, setGamePlayers] = useState<Player[]>(initialPlayers);
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());
  const [playerTurnCounts, setPlayerTurnCounts] = useState<number[]>(initialPlayers.map(() => 0));
  
  const questionStartTimeRef = useRef<number>(0);

  const { isMultiplayerMode, isPartyMode, modeSettings, targetQuestionsPerPlayer } = useMemo(() => ({
    isMultiplayerMode: mode === 'party',
    isPartyMode: mode === 'party',
    modeSettings: MODE_CONFIG[mode] ?? { timePerQuestion: 20, scoreMultiplier: 1, description: '' },
    targetQuestionsPerPlayer: questions.length,
  }), [mode, questions.length]);

  const getRandomQuestion = useCallback((exclude: Set<number>): number | null => {
    const available = questions
      .map((_, i) => i)
      .filter(i => !exclude.has(i));
    
    if (available.length === 0) {
      return null;
    }
    return available[Math.floor(Math.random() * available.length)];
  }, [questions]);

  const currentQuestionIndex = gameState.currentQuestionIndex ?? 0;
  const currentQuestion = questions[currentQuestionIndex];
  const currentPlayer = gamePlayers[gameState.currentPlayerIndex];

  const isLastQuestion = (gameState.currentQuestionIndex ?? 0) >= questions.length - 1;
  const isLastPlayer = gameState.currentPlayerIndex >= gamePlayers.length - 1;
  const currentPlayerTurnCount = playerTurnCounts[gameState.currentPlayerIndex];

  const calculateScore = useCallback((_answerTime: number, isCorrect: boolean) => {
    if (!isCorrect) return 0;
    const score = GAME_CONFIG.SCORE_BASE * modeSettings.scoreMultiplier;
    return Math.floor(score);
  }, [modeSettings.scoreMultiplier]);

  const handleTimeUp = useCallback(() => {
    if (!gameState.showResult) {
      const answerTime = GAME_CONFIG.TIME_BONUS_THRESHOLD;
      const points = calculateScore(answerTime, false);
      
      setGameState(prev => ({
        ...prev,
        selectedAnswer: '',
        showResult: true,
        isPaused: true,
      }));
      
      setGamePlayers(prev => prev.map((p, idx) => 
        idx === gameState.currentPlayerIndex
          ? { ...p, score: p.score + points }
          : p
      ));
    }
  }, [gameState.showResult, gameState.currentPlayerIndex, calculateScore]);

  const handleAnswer = useCallback((answer: string) => {
    if (gameState.selectedAnswer || gameState.showResult) return;
    
    const answerTime = Date.now() - questionStartTimeRef.current;
    const isCorrect = answer === currentQuestion.correct_answer;
    const points = calculateScore(answerTime, isCorrect);

    setGameState(prev => ({
      ...prev,
      selectedAnswer: answer,
      showResult: true,
      isPaused: true,
    }));

    setGamePlayers(prev => prev.map((p, idx) => 
      idx === gameState.currentPlayerIndex
        ? { 
            ...p, 
            score: p.score + points,
            answers: [...p.answers, {
              questionId: currentQuestion.id,
              answer,
              correct: isCorrect,
              timeMs: answerTime,
              points,
            }],
            streak: isCorrect ? p.streak + 1 : 0,
            maxStreak: isCorrect ? Math.max(p.maxStreak, p.streak + 1) : p.maxStreak,
          }
        : p
    ));
  }, [gameState.selectedAnswer, gameState.showResult, gameState.currentPlayerIndex, currentQuestion, calculateScore]);

  const handleNext = useCallback(() => {
    const newUsedQuestions = new Set(usedQuestions).add(currentQuestionIndex);
    const currentPlayerIdx = gameState.currentPlayerIndex;
    const newTurnCounts = [...playerTurnCounts];
    newTurnCounts[currentPlayerIdx] += 1;

    if (isPartyMode) {
      const currentPlayerDone = newTurnCounts[currentPlayerIdx] >= targetQuestionsPerPlayer;
      
      if (currentPlayerDone && newTurnCounts.every((count, idx) => idx === currentPlayerIdx || count >= targetQuestionsPerPlayer)) {
        onGameEnd(gamePlayers);
      } else if (currentPlayerDone) {
        const nextPlayerIdx = newTurnCounts.findIndex((count, idx) => idx !== currentPlayerIdx && count < targetQuestionsPerPlayer);
        if (nextPlayerIdx !== -1) {
          const nextIdx = getRandomQuestion(newUsedQuestions);
          if (nextIdx === null) {
            onGameEnd(gamePlayers);
            return;
          }
          setUsedQuestions(newUsedQuestions);
          setPlayerTurnCounts(newTurnCounts);
          setGameState(prev => ({
            ...prev,
            currentPlayerIndex: nextPlayerIdx,
            currentQuestionIndex: nextIdx,
            selectedAnswer: null,
            showResult: false,
            isPaused: false,
          }));
          questionStartTimeRef.current = Date.now();
        } else {
          onGameEnd(gamePlayers);
        }
      } else {
        const nextIdx = getRandomQuestion(newUsedQuestions);
        if (nextIdx === null) {
          onGameEnd(gamePlayers);
          return;
        }
        setUsedQuestions(newUsedQuestions);
        setPlayerTurnCounts(newTurnCounts);
        let nextPlayer = currentPlayerIdx + 1;
        if (nextPlayer >= gamePlayers.length) {
          nextPlayer = newTurnCounts.findIndex((count) => count < targetQuestionsPerPlayer);
        }
        if (nextPlayer === -1) {
          onGameEnd(gamePlayers);
          return;
        }
        setGameState(prev => ({
          ...prev,
          currentPlayerIndex: nextPlayer,
          currentQuestionIndex: nextIdx,
          selectedAnswer: null,
          showResult: false,
          isPaused: false,
        }));
        questionStartTimeRef.current = Date.now();
      }
    } else {
      if (isLastPlayer) {
        if (isLastQuestion) {
          onGameEnd(gamePlayers);
        } else {
          setGameState(prev => ({
            ...prev,
            currentQuestionIndex: (prev.currentQuestionIndex ?? 0) + 1,
            currentPlayerIndex: 0,
            selectedAnswer: null,
            showResult: false,
            isPaused: false,
          }));
        }
      } else {
        setGameState(prev => ({
          ...prev,
          currentPlayerIndex: prev.currentPlayerIndex + 1,
          selectedAnswer: null,
          showResult: false,
          isPaused: false,
        }));
      }
    }
  }, [isPartyMode, isLastPlayer, isLastQuestion, gamePlayers, currentQuestionIndex, usedQuestions, getRandomQuestion, onGameEnd, playerTurnCounts, targetQuestionsPerPlayer, gameState.currentPlayerIndex]);

  const getNextPlayerName = useCallback(() => {
    if (isPartyMode) {
      const currentPlayerDone = playerTurnCounts[gameState.currentPlayerIndex] >= targetQuestionsPerPlayer;
      const allDone = playerTurnCounts.every(count => count >= targetQuestionsPerPlayer);
      
      if (allDone) {
        return 'Fin de la partie';
      }
      if (currentPlayerDone) {
        const nextIdx = playerTurnCounts.findIndex((count) => count < targetQuestionsPerPlayer);
        if (nextIdx !== -1 && nextIdx < gamePlayers.length) {
          return `${gamePlayers[nextIdx].name}`;
        }
        return 'Question suivante';
      }
      let nextIdx = gameState.currentPlayerIndex + 1;
      if (nextIdx >= gamePlayers.length) {
        nextIdx = playerTurnCounts.findIndex((count) => count < targetQuestionsPerPlayer);
      }
      if (nextIdx !== -1 && nextIdx < gamePlayers.length) {
        return `${gamePlayers[nextIdx].name}`;
      }
      return 'Question suivante';
    }
    
    if (isLastPlayer) {
      return isLastQuestion ? 'Fin de la partie' : 'Question suivante';
    }
    const nextIdx = gameState.currentPlayerIndex + 1;
    return nextIdx < gamePlayers.length ? `${gamePlayers[nextIdx].name}` : 'Question suivante';
  }, [isPartyMode, isLastPlayer, isLastQuestion, gamePlayers, gameState.currentPlayerIndex, playerTurnCounts, targetQuestionsPerPlayer]);

  if (!currentQuestion) return null;

  return (
    <div className="game-screen">
      <GameHeader
        onExit={onExit}
        players={gamePlayers}
        currentIndex={isPartyMode ? currentPlayerTurnCount : currentQuestionIndex}
        totalQuestions={isPartyMode ? targetQuestionsPerPlayer : questions.length}
      />
      
      <main className="game-content">
        {isMultiplayerMode && gamePlayers.length > 1 && (
          <div className="turn-indicator">
            <span className="turn-player" style={{ color: currentPlayer?.color?.bg }}>
              {currentPlayer?.name}
            </span>
            {isPartyMode ? (
              <span className="turn-info">
                Question {currentPlayerTurnCount + 1}/{targetQuestionsPerPlayer} - {currentPlayer?.name}
              </span>
            ) : (
              <span className="turn-info">
                Tour {gameState.currentPlayerIndex + 1}/{gamePlayers.length}
              </span>
            )}
          </div>
        )}

        <QuestionDisplay
          question={currentQuestion}
          questionNumber={isPartyMode ? (currentPlayerTurnCount + 1) : (gameState.currentQuestionIndex ?? 0) + 1}
          totalQuestions={isPartyMode ? targetQuestionsPerPlayer : questions.length}
        />

        {!isMultiplayerMode || gamePlayers.length === 1 ? (
          <>
            <Timer
              timerKey={`${currentQuestionIndex}-${gameState.currentPlayerIndex}`}
              duration={modeSettings.timePerQuestion}
              onTimeUp={handleTimeUp}
              isPaused={gameState.isPaused}
            />
            <AnswerOptions
              options={currentQuestion.allAnswers}
              correctAnswer={currentQuestion.correct_answer}
              selectedAnswer={gameState.selectedAnswer}
              onAnswer={handleAnswer}
              disabled={gameState.isPaused}
              showResult={gameState.showResult}
            />
          </>
        ) : (
          <>
            <div className="turn-player-card" style={{ borderColor: currentPlayer?.color?.bg }}>
              <div className="turn-player-avatar" style={{ backgroundColor: currentPlayer?.color?.bg }}>
                {currentPlayer?.name.charAt(0).toUpperCase()}
              </div>
              <span className="turn-player-name">{currentPlayer?.name}</span>
            </div>

            <Timer
              timerKey={`${currentQuestionIndex}-${gameState.currentPlayerIndex}`}
              duration={modeSettings.timePerQuestion}
              onTimeUp={handleTimeUp}
              isPaused={gameState.isPaused}
            />

            <AnswerOptions
              options={currentQuestion.allAnswers}
              correctAnswer={currentQuestion.correct_answer}
              selectedAnswer={gameState.selectedAnswer}
              onAnswer={handleAnswer}
              disabled={gameState.isPaused}
              showResult={gameState.showResult}
            />
          </>
        )}

        {gameState.showResult && (
          <div className="result-actions">
            <button className="btn-primary" onClick={handleNext}>
              {getNextPlayerName()}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

interface GameHeaderProps {
  onExit: () => void;
  players: Player[];
  currentIndex: number;
  totalQuestions: number;
}

function GameHeader({ onExit, players, currentIndex, totalQuestions }: GameHeaderProps) {
  return (
    <header className="game-header">
      <button className="exit-btn" onClick={onExit}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <ScoreBoard players={players} compact />
      <div className="question-progress">
        <span>{currentIndex + 1}/{totalQuestions}</span>
      </div>
    </header>
  );
}