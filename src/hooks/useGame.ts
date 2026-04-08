import { useState, useCallback } from 'react';
import type { Player, GameSettings, Question } from '../types/game';
import { QUESTION_SERVICE, PLAYER_SERVICE } from '../services';

interface UseGameState {
  phase: 'setup' | 'playing' | 'final-results';
  players: Player[];
  settings: GameSettings | null;
  questions: Question[];
}

interface UseGameReturn extends UseGameState {
  startGame: (settings: GameSettings, players: Player[]) => Promise<void>;
  restartGame: () => Promise<void>;
  endGame: (finalPlayers: Player[]) => void;
  resetGame: () => void;
}

export function useGame(): UseGameReturn {
  const [state, setState] = useState<UseGameState>({
    phase: 'setup',
    players: [],
    settings: null,
    questions: [],
  });

  const startGame = useCallback(async (settings: GameSettings, players: Player[]) => {
    try {
      const fetchedQuestions = await QUESTION_SERVICE.fetch(settings.questionsPerRound);

      if (fetchedQuestions.length === 0) {
        console.error('No questions fetched');
        return;
      }

      setState({
        phase: 'playing',
        players,
        settings,
        questions: fetchedQuestions,
      });
    } catch (err) {
      console.error('Failed to start game:', err);
    }
  }, []);

  const restartGame = useCallback(async () => {
    if (!state.settings) return;

    const resetPlayers = state.players.map(PLAYER_SERVICE.resetScore);

    const fetchedQuestions = await QUESTION_SERVICE.fetch(state.settings.questionsPerRound);

    setState(prev => ({
      ...prev,
      phase: 'playing',
      players: resetPlayers,
      questions: fetchedQuestions,
    }));
  }, [state.settings, state.players]);

  const endGame = useCallback((finalPlayers: Player[]) => {
    setState(prev => ({
      ...prev,
      phase: 'final-results',
      players: finalPlayers,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState({
      phase: 'setup',
      players: [],
      settings: null,
      questions: [],
    });
  }, []);

  return {
    phase: state.phase,
    players: state.players,
    settings: state.settings,
    questions: state.questions,
    startGame,
    restartGame,
    endGame,
    resetGame,
  };
}
