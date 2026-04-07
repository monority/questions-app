import type { Player, AnswerRecord, PlayerColor, Badge } from '../types/game';
import { GAME_CONFIG, LEVELS, BADGES, DEFAULT_STATS } from '../config';
import { PLAYER_COLORS } from '../config/constants';

const PROGRESS_STORAGE_KEY = 'quiz_progress';

export const PLAYER_SERVICE = {
  create(name: string, index: number): Player {
    return {
      id: PLAYER_SERVICE.generateId(),
      name: PLAYER_SERVICE.sanitizeName(name),
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

  sanitizeName(name: string): string {
    const CONTROL_CHARS = /[\x00-\x1F\x7F]/gu;
    return name
      .trim()
      .replace(/[<>\"'&]/g, '')
      .replace(CONTROL_CHARS, '')
      .slice(0, 20);
  },

  isValidName(name: string): boolean {
    const sanitized = this.sanitizeName(name);
    return sanitized.length > 0;
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

  validateProgress(data: unknown): { xp: number; level: number; badges: Badge[] } | null {
    if (typeof data !== 'object' || data === null) return null;
    const obj = data as Record<string, unknown>;
    const xp = typeof obj.xp === 'number' ? Math.max(0, Math.floor(obj.xp)) : 0;
    const level = typeof obj.level === 'number' ? Math.max(1, Math.min(10, Math.floor(obj.level))) : 1;
    const badges = Array.isArray(obj.badges) ? obj.badges.filter((b): b is Badge => 
      typeof b === 'object' && b !== null && 
      typeof b.id === 'string' && typeof b.name === 'string'
    ) : [];
    return { xp, level, badges };
  },

  saveProgress(playerId: string, progress: { xp: number; level: number; badges: Badge[] }): void {
    try {
      const validated = this.validateProgress(progress);
      if (!validated) return;
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      const allProgress = stored ? this.validateStoredData(stored) : {};
      allProgress[playerId] = validated;
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(allProgress));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  },

  validateStoredData(data: string): Record<string, { xp: number; level: number; badges: Badge[] }> {
    try {
      const parsed = JSON.parse(data);
      if (typeof parsed !== 'object' || parsed === null) return {};
      const result: Record<string, { xp: number; level: number; badges: Badge[] }> = {};
      for (const [key, value] of Object.entries(parsed)) {
        const validated = this.validateProgress(value);
        if (validated) result[key] = validated;
      }
      return result;
    } catch {
      return {};
    }
  },

  loadProgress(playerId: string): { xp: number; level: number; badges: Badge[] } | null {
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (stored) {
        const allProgress = this.validateStoredData(stored);
        return allProgress[playerId] || null;
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
    return null;
  },
} as const;
