import type { PlayerColor } from '../types/game';

export const PLAYER_COLORS: PlayerColor[] = [
  { bg: '#FF6B6B', border: '#FF5252', name: 'Rouge' },
  { bg: '#4ECDC4', border: '#26A69A', name: 'Turquoise' },
  { bg: '#FFE66D', border: '#FFC107', name: 'Jaune' },
  { bg: '#95E1D3', border: '#66BB6A', name: 'Menthe' },
  { bg: '#F38181', border: '#EF5350', name: 'Corail' },
  { bg: '#AA96DA', border: '#7E57C2', name: 'Violet' },
  { bg: '#FCBAD3', border: '#EC407A', name: 'Rose' },
  { bg: '#A8D8EA', border: '#29B6F6', name: 'Bleu ciel' },
];

export const DIFFICULTY_COLORS = {
  easy: '#4CAF50',
  medium: '#FF9800',
  hard: '#F44336',
} as const;

export const DIFFICULTY_LABELS = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
} as const;

export const CATEGORIES = [
  { id: 9, name: 'Culture Générale' },
  { id: 17, name: 'Science & Nature' },
  { id: 18, name: 'Informatique' },
  { id: 21, name: 'Sports' },
  { id: 22, name: 'Géographie' },
  { id: 23, name: 'Histoire' },
  { id: 25, name: 'Art' },
  { id: 26, name: 'Célébrités' },
  { id: 27, name: 'Animaux' },
  { id: 11, name: 'Films' },
  { id: 12, name: 'Musique' },
  { id: 10, name: 'Livres' },
] as const;

export const BOT_NAMES = ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 'Bot Epsilon', 'Bot Zeta'] as const;

export const BOT_COLORS: PlayerColor[] = [
  { bg: '#ef4444', border: '#f87171', name: 'Rouge' },
  { bg: '#f59e0b', border: '#fbbf24', name: 'Orange' },
  { bg: '#10b981', border: '#34d399', name: 'Vert' },
  { bg: '#3b82f6', border: '#60a5fa', name: 'Bleu' },
  { bg: '#8b5cf6', border: '#a78bfa', name: 'Violet' },
  { bg: '#ec4899', border: '#f472b6', name: 'Rose' },
];
