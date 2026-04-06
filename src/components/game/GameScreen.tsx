import { useState, useCallback, useRef, useEffect } from 'react';
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
  currentQuestionIndex: number;
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

const isPartyMode = (m: GameMode) => m === 'party';

export function GameScreen({ players: initialPlayers, mode, questions, onGameEnd, onExit }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [gamePlayers, setGamePlayers] = useState<Player[]>(initialPlayers);
  const [usedQuestionIndices, setUsedQuestionIndices] = useState<Set<number>>(new Set());
  
  const questionStartTimeRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);
  const prevQuestionIndexRef = useRef<number>(-1);

  const isMultiplayerMode = ['duel', 'party', 'tournament', 'competitive'].includes(mode);
  const partyMode = isPartyMode(mode);
  const modeSettings = MODE_CONFIG[mode] || MODE_CONFIG.solo;

  const getNextQuestionIndex = useCallback(() => {
    const availableIndices = questions
      .map((_, idx) => idx)
      .filter(idx => !usedQuestionIndices.has(idx));
    
    if (availableIndices.length === 0) return 0;
    
    const randomIdx = Math.floor(Math.random() * availableIndices.length);
    return availableIndices[randomIdx];
  }, [usedQuestionIndices, questions.length]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(() => {
    if (partyMode) {
      const idx = Math.floor(Math.random() * questions.length);
      return idx;
    }
    return 0;
  });

  useEffect(() => {
    if (prevQuestionIndexRef.current !== currentQuestionIndex || partyMode) {
      prevQuestionIndexRef.current = currentQuestionIndex;
      questionStartTimeRef.current = Date.now();
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGameState({
        currentQuestionIndex: currentQuestionIndex,
        currentPlayerIndex: 0,
        selectedAnswer: null,
        showResult: false,
        isPaused: false,
      });
    }
  }, [currentQuestionIndex, partyMode]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentPlayer = gamePlayers[gameState.currentPlayerIndex];

  const isLastQuestion = partyMode 
    ? usedQuestionIndices.size >= questions.length - 1
    : gameState.currentQuestionIndex >= questions.length - 1;
  const isLastPlayer = gameState.currentPlayerIndex >= gamePlayers.length - 1;

  const calculateScore = useCallback((answerTime: number, isCorrect: boolean) => {
    if (!isCorrect) return 0;
    let score = GAME_CONFIG.SCORE_BASE * modeSettings.scoreMultiplier;
    if (mode === 'competitive' || mode === 'duel') {
      const timeBonus = Math.max(0, Math.floor((GAME_CONFIG.TIME_BONUS_THRESHOLD - answerTime) / 1000) * GAME_CONFIG.TIME_BONUS_MULTIPLIER);
      score += timeBonus;
    }
    return Math.floor(score);
  }, [mode, modeSettings.scoreMultiplier]);

  const handleTimeUp = useCallback(() => {
    if (!gameState.showResult) {
      const answerTime = GAME_CONFIG.TIME_BONUS_THRESHOLD;
      const isCorrect = false;
      const points = calculateScore(answerTime, isCorrect);
      
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
    if (partyMode) {
      const allQuestionsUsed = usedQuestionIndices.size >= questions.length - 1;
      const allPlayersDone = isLastPlayer;
      
      if (allPlayersDone) {
        if (allQuestionsUsed) {
          onGameEnd(gamePlayers);
        } else {
          const nextIdx = getNextQuestionIndex();
          setCurrentQuestionIndex(nextIdx);
          setUsedQuestionIndices(prev => new Set(prev).add(nextIdx));
          setGameState(prev => ({
            ...prev,
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
    } else {
      if (isLastPlayer) {
        if (isLastQuestion) {
          onGameEnd(gamePlayers);
        } else {
          setGameState(prev => ({
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
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
  }, [partyMode, isLastPlayer, isLastQuestion, gamePlayers, questions.length, usedQuestionIndices.size, getNextQuestionIndex, onGameEnd]);

  const getNextPlayerName = () => {
    if (partyMode) {
      const allQuestionsUsed = usedQuestionIndices.size >= questions.length - 1;
      const allPlayersDone = isLastPlayer;
      
      if (allPlayersDone) {
        if (allQuestionsUsed) {
          return 'Fin de la partie';
        }
        return 'Question suivante';
      }
      return `${gamePlayers[gameState.currentPlayerIndex + 1].name}`;
    }
    
    if (isLastPlayer) {
      return isLastQuestion ? 'Fin de la partie' : 'Question suivante';
    }
    return `${gamePlayers[gameState.currentPlayerIndex + 1].name}`;
  };

  if (!currentQuestion) return null;

  return (
    <div className="game-screen">
      <GameHeader
        onExit={onExit}
        players={gamePlayers}
        currentIndex={gameState.currentQuestionIndex}
        totalQuestions={questions.length}
      />
      
      <main className="game-content">
        {isMultiplayerMode && gamePlayers.length > 1 && (
          <div className="turn-indicator">
            <span className="turn-player" style={{ color: currentPlayer?.color?.bg }}>
              {currentPlayer?.name}
            </span>
            {partyMode ? (
              <span className="turn-info">
                Question {usedQuestionIndices.size + 1}/{questions.length}
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
          questionNumber={partyMode ? usedQuestionIndices.size + 1 : gameState.currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />

        {!isMultiplayerMode || gamePlayers.length === 1 ? (
          <>
            <Timer
              key={`${currentQuestionIndex}-${gameState.currentPlayerIndex}`}
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
              key={`${currentQuestionIndex}-${gameState.currentPlayerIndex}`}
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