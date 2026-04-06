export type GameMode = 'solo' | 'duel' | 'tournament' | 'party' | 'competitive' | 'cooperative';

export type GameType = 'solo' | 'multiplayer';

export type GamePhase = 'setup' | 'playing' | 'round-results' | 'final-results';

export type PlayerStatus = 'playing' | 'eliminated' | 'winner' | 'finished';

export interface PlayerColor {
  bg: string;
  border: string;
  name: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  xp: number;
  level: number;
  color: PlayerColor;
  answers: AnswerRecord[];
  streak: number;
  maxStreak: number;
  status: PlayerStatus;
  rank?: number;
  badges: Badge[];
}

export interface AnswerRecord {
  questionId: number;
  answer: string;
  correct: boolean;
  timeMs: number;
  points: number;
}

export interface Question {
  id: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple' | 'boolean';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  allAnswers: string[];
}

export interface GameSettings {
  mode: GameMode;
  type: GameType;
  playerCount: number;
  questionsPerRound: number;
  timePerQuestion: number;
  categories: string[];
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
}

export interface RoundResult {
  question: Question;
  playerAnswers: Map<string, { answer: string; timeMs: number }>;
  correctAnswer: string;
  fastestPlayerId?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface GameStats {
  totalGames: number;
  totalQuestions: number;
  correctAnswers: number;
  bestStreak: number;
  averageTime: number;
  favoriteCategory: string;
}

export interface PlayerProgress {
  playerId: string;
  stats: GameStats;
  badges: Badge[];
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export const LEVELS = [
  { level: 1, xp: 0, title: 'Novice' },
  { level: 2, xp: 100, title: 'Apprenti' },
  { level: 3, xp: 300, title: 'Connaisseur' },
  { level: 4, xp: 600, title: 'Expert' },
  { level: 5, xp: 1000, title: 'Maître' },
  { level: 6, xp: 1500, title: 'Grand Maître' },
  { level: 7, xp: 2200, title: 'Légende' },
  { level: 8, xp: 3000, title: 'Champion' },
  { level: 9, xp: 4000, title: 'Virtuose' },
  { level: 10, xp: 5500, title: 'Immortel' },
];

export const BADGES = [
  { id: 'first_win', name: 'Première Victoire', description: 'Gagnez votre première partie', icon: '🏆' },
  { id: 'streak_5', name: 'Série de 5', description: 'Répondez correctement à 5 questions de suite', icon: '🔥' },
  { id: 'speed_demon', name: 'Foudre', description: 'Répondez en moins de 3 secondes', icon: '⚡' },
  { id: 'perfect_game', name: 'Partie Parfaite', description: 'Faites un sans-faute', icon: '💯' },
  { id: 'polyglotte', name: 'Polyglotte', description: 'Jouez dans toutes les catégories', icon: '🌍' },
  { id: 'night_owl', name: 'Noctambule', description: 'Jouez après minuit', icon: '🦉' },
  { id: 'dedicated', name: 'Dévoué', description: 'Jouez 10 parties', icon: '⭐' },
  { id: 'collector', name: 'Collectionneur', description: 'Obtenez 10 badges', icon: '🎖️' },
];

export const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  totalQuestions: 0,
  correctAnswers: 0,
  bestStreak: 0,
  averageTime: 0,
  favoriteCategory: '',
};
