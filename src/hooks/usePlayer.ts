import { useState, useEffect, useCallback } from 'react';
import type { Player, Badge } from '../types/game';
import { PLAYER_SERVICE } from '../services/playerService';
import { LEVELS } from '../types/game';

interface UsePlayerReturn {
  player: Player | null;
  isLoading: boolean;
  updateStats: (answers: { correct: boolean; timeMs: number; points: number }[]) => Badge[];
  setPlayerName: (name: string) => void;
  getLevelInfo: () => { title: string; xpNeeded: number; progress: number; currentXp: number; nextLevelXp: number } | null;
  getBadges: () => Badge[];
  resetProgress: () => void;
}

const PROGRESS_KEY = 'quiz_player_data';

export function usePlayer(): UsePlayerReturn {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlayer({
          id: data.id || crypto.randomUUID(),
          name: data.name || 'Joueur',
          score: 0,
          xp: data.xp || 0,
          level: data.level || 1,
          color: { bg: '#6366f1', border: '#818cf8', name: 'Violet' },
          answers: [],
          streak: 0,
          maxStreak: data.maxStreak || 0,
          status: 'playing',
          badges: data.badges || [],
        });
      } catch {
        setPlayer(null);
      }
    }
    setIsLoading(false);
  }, []);

  const saveProgress = useCallback((p: Player) => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({
      id: p.id,
      name: p.name,
      xp: p.xp,
      level: p.level,
      maxStreak: p.maxStreak,
      badges: p.badges,
    }));
  }, []);

  const setPlayerName = useCallback((name: string) => {
    if (!player) return;
    const updated = { ...player, name: name || 'Joueur' };
    setPlayer(updated);
    saveProgress(updated);
  }, [player, saveProgress]);

  const updateStats = useCallback((answers: { correct: boolean; timeMs: number; points: number }[]): Badge[] => {
    if (!player || answers.length === 0) return [];

    let totalXp = player.xp;
    let maxStreak = player.maxStreak;
    let currentStreak = 0;

    answers.forEach(answer => {
      if (answer.correct) {
        currentStreak++;
        totalXp += Math.floor(answer.points * 0.5) + 10;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    const newLevel = PLAYER_SERVICE.getLevelForXp(totalXp);
    const earnedBadges: Badge[] = [];

    if (newLevel > player.level) {
      earnedBadges.push({ 
        id: 'level_up', 
        name: 'Niveau supérieur!', 
        icon: '⬆️', 
        description: `Vous avez atteint le niveau ${newLevel}`, 
        earnedAt: new Date() 
      });
    }

    if (maxStreak >= 5 && !player.badges.some(b => b.id === 'streak_5')) {
      earnedBadges.push({ 
        id: 'streak_5', 
        name: 'Série de 5', 
        icon: '🔥', 
        description: '5 réponses correctes de suite', 
        earnedAt: new Date() 
      });
    }

    if (answers.some(a => a.correct && a.timeMs < 3000) && !player.badges.some(b => b.id === 'speed_demon')) {
      earnedBadges.push({ 
        id: 'speed_demon', 
        name: 'Réponse éclair', 
        icon: '⚡', 
        description: 'Réponse correcte en moins de 3 secondes', 
        earnedAt: new Date() 
      });
    }

    const updated: Player = {
      ...player,
      xp: totalXp,
      level: newLevel,
      maxStreak,
      badges: [...player.badges, ...earnedBadges],
    };

    setPlayer(updated);
    saveProgress(updated);

    return earnedBadges;
  }, [player, saveProgress]);

  const getLevelInfo = useCallback(() => {
    if (!player) return null;
    const current = LEVELS.find(l => l.level === player.level);
    const next = LEVELS.find(l => l.level === player.level + 1);
    const currentXp = current?.xp || 0;
    const nextXp = next?.xp || currentXp + 100;
    const progress = nextXp > currentXp ? ((player.xp - currentXp) / (nextXp - currentXp)) * 100 : 100;
    return {
      title: current?.title || 'Novice',
      xpNeeded: Math.max(0, nextXp - player.xp),
      progress: Math.min(100, Math.max(0, progress)),
      currentXp: player.xp - currentXp,
      nextLevelXp: nextXp - currentXp,
    };
  }, [player]);

  const getBadges = useCallback(() => player?.badges || [], [player]);

  const resetProgress = useCallback(() => {
    localStorage.removeItem(PROGRESS_KEY);
    setPlayer(null);
  }, []);

  return { 
    player, 
    isLoading, 
    updateStats, 
    setPlayerName,
    getLevelInfo, 
    getBadges,
    resetProgress,
  };
}