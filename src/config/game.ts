import { LEVELS, BADGES, DEFAULT_STATS, type Badge, type GameStats } from '../types/game';
import type { GameMode } from '../types/game';

export const GAME_CONFIG = {
  DEFAULT_QUESTION_COUNT: 10,
  MAX_PLAYERS: 8,
  MIN_PLAYERS: 1,
  DEFAULT_TIME_PER_QUESTION: 20,
  MAX_TIME_PER_QUESTION: 30,
  SCORE_BASE: 10,
  TIME_BONUS_MULTIPLIER: 2,
  TIME_BONUS_THRESHOLD: 30000,
  QUESTION_COUNTS: [5, 10, 15, 20],
  PLAYERS_PER_SCREEN: 4,
} as const;

export const MODE_CONFIG: Partial<Record<GameMode, { timePerQuestion: number; scoreMultiplier: number; description: string }>> = {
  solo: { timePerQuestion: 20, scoreMultiplier: 1, description: 'Modo normal' },
  party: { timePerQuestion: 20, scoreMultiplier: 1, description: 'Pour plusieurs joueurs' },
};

export const API_CONFIG = {
  BASE_URL: 'https://opentdb.com/api.php',
  DEFAULT_AMOUNT: 50,
  QUESTION_TYPE: 'multiple',
} as const;

export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  RESULT_DISPLAY_DELAY: 300,
  XP_PER_CORRECT_ANSWER: 10,
  XP_BONUS_STREAK: 5,
  POINTS_FOR_FAST_ANSWER: 5,
} as const;

export { LEVELS, BADGES, DEFAULT_STATS };
export type { Badge, GameStats };
