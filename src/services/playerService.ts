import type { Player, AnswerRecord, PlayerColor, Badge } from '../types/game';
import { GAME_CONFIG, LEVELS, BADGES, DEFAULT_STATS } from '../config';
import { PLAYER_COLORS } from '../config/constants';

const PROGRESS_STORAGE_KEY = 'quiz_progress';

export const PLAYER_SERVICE = {
  create(name: string, index: number): Player {
    return {
      id: PLAYER_SERVICE.generateId(),
      name: name.trim(),
      score: 0,
      xp: 0,
      level: 1,
      color: PLAYER_SERVICE.getPlayerColor(index),
      answers: [],
      streak: 0,
      maxStreak: 0,
      status: 'playing',
      badges: [],
    };
  },

  getPlayerColor(index: number): PlayerColor {
    return PLAYER_COLORS[index % PLAYER_COLORS.length] ?? PLAYER_COLORS[0]!;
  },

  generateId(): string {
    return crypto.randomUUID();
  },

  resetScore(player: Player): Player {
    return { 
      ...player, 
      score: 0, 
      answers: [],
      streak: 0,
    };
  },

  addAnswer(player: Player, answer: AnswerRecord): Player {
    const newStreak = answer.correct ? player.streak + 1 : 0;
    const newMaxStreak = Math.max(player.maxStreak, newStreak);
    const xpEarned = answer.correct ? Math.floor(answer.points * 0.5) + (answer.correct ? 10 : 0) : 0;
    const newXp = player.xp + xpEarned;
    const newLevel = PLAYER_SERVICE.getLevelForXp(newXp);

    return {
      ...player,
      score: player.score + answer.points,
      xp: newXp,
      level: newLevel,
      answers: [...player.answers, answer],
      streak: newStreak,
      maxStreak: newMaxStreak,
    };
  },

  getLevelForXp(xp: number): number {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xp) {
        return LEVELS[i].level;
      }
    }
    return 1;
  },

  getLevelTitle(level: number): string {
    const levelData = LEVELS.find(l => l.level === level);
    return levelData?.title || 'Novice';
  },

  getXpForNextLevel(currentLevel: number): number {
    const nextLevel = LEVELS.find(l => l.level === currentLevel + 1);
    return nextLevel?.xp || LEVELS[LEVELS.length - 1].xp;
  },

  getXpProgress(xp: number, level: number): number {
    const currentLevelXp = LEVELS.find(l => l.level === level)?.xp || 0;
    const nextLevelXp = PLAYER_SERVICE.getXpForNextLevel(level);
    return ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  },

  getCorrectCount(player: Player): number {
    return player.answers.filter(a => a.correct).length;
  },

  sortByScore(players: Player[]): Player[] {
    return [...players].sort((a, b) => b.score - a.score);
  },

  getWinner(players: Player[]): Player | null {
    const sorted = PLAYER_SERVICE.sortByScore(players);
    return sorted[0] ?? null;
  },

  isValidName(name: string): boolean {
    return name.trim().length > 0 && name.trim().length <= 20;
  },

  canAddPlayer(currentCount: number): boolean {
    return currentCount < GAME_CONFIG.MAX_PLAYERS;
  },

  canStartGame(playerCount: number): boolean {
    return playerCount >= GAME_CONFIG.MIN_PLAYERS;
  },

  checkAndAwardBadges(player: Player): Badge[] {
    const newBadges: Badge[] = [];
    const stats = PLAYER_SERVICE.getPlayerStats(player);

    if (stats.totalGames >= 1 && !player.badges.some(b => b.id === 'first_win')) {
      const badge = BADGES.find(b => b.id === 'first_win');
      if (badge) {
        newBadges.push({ ...badge, earnedAt: new Date() });
      }
    }

    if (player.maxStreak >= 5 && !player.badges.some(b => b.id === 'streak_5')) {
      const badge = BADGES.find(b => b.id === 'streak_5');
      if (badge) {
        newBadges.push({ ...badge, earnedAt: new Date() });
      }
    }

    if (player.answers.some(a => a.correct && a.timeMs < 3000) && !player.badges.some(b => b.id === 'speed_demon')) {
      const badge = BADGES.find(b => b.id === 'speed_demon');
      if (badge) {
        newBadges.push({ ...badge, earnedAt: new Date() });
      }
    }

    return newBadges;
  },

  getPlayerStats(player: Player) {
    const totalQuestions = player.answers.length;
    const correctAnswers = player.answers.filter(a => a.correct).length;
    const averageTime = totalQuestions > 0 
      ? player.answers.reduce((sum, a) => sum + a.timeMs, 0) / totalQuestions 
      : 0;
    
    return {
      ...DEFAULT_STATS,
      totalGames: 1,
      totalQuestions,
      correctAnswers,
      bestStreak: player.maxStreak,
      averageTime,
    };
  },

  saveProgress(playerId: string, progress: { xp: number; level: number; badges: Badge[] }): void {
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      const allProgress = stored ? JSON.parse(stored) : {};
      allProgress[playerId] = progress;
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(allProgress));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  },

  loadProgress(playerId: string): { xp: number; level: number; badges: Badge[] } | null {
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (stored) {
        const allProgress = JSON.parse(stored);
        return allProgress[playerId] || null;
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
    return null;
  },
} as const;
