import { useState, useEffect, useCallback } from 'react';
import type { Player, Badge } from '../types/game';
import { PLAYER_SERVICE } from '../services/playerService';
import { SECURITY_SERVICE } from '../services/securityService';
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
          xp: SECURITY_SERVICE.validateXp(data.xp || 0),
          level: SECURITY_SERVICE.validateLevel(data.level || 1),
          color: { bg: '#6366f1', border: '#818cf8', name: 'Violet' },
          answers: [],
          streak: 0,
          maxStreak: Math.max(0, Math.min(1000, data.maxStreak || 0)),
          status: 'playing',
          badges: (Array.isArray(data.badges) ? data.badges : []).filter((b: unknown): b is Badge => b !== null && typeof b === 'object' && typeof (b as { id?: unknown }).id === 'string'),
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
    // Assuming color is always present or has a default, otherwise handle it.
    color: p.color,
    // Assuming status is always present or has a default, otherwise handle it.
    status: p.status,
    // Assuming answers is always present or has a default, otherwise handle it.
    answers: p.answers,

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
    let totalCorrect = 0;
    let perfectGame = true;

    answers.forEach(answer => {
      if (answer.correct) {
        currentStreak++;
        totalCorrect++;
        totalXp += Math.floor(answer.points * 0.5) + 10;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
        perfectGame = false;
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

    if (maxStreak >= 10 && !player.badges.some(b => b.id === 'streak_10')) {
      earnedBadges.push({ 
        id: 'streak_10', 
        name: 'Série de 10', 
        icon: '💥', 
        description: '10 réponses correctes de suite', 
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

    if (totalCorrect >= 10 && !player.badges.some(b => b.id === 'perfect_10')) {
      earnedBadges.push({ 
        id: 'perfect_10', 
        name: 'Série parfaite', 
        icon: '✨', 
        description: '10 réponses correctes en une partie', 
        earnedAt: new Date() 
      });
    }

    if (perfectGame && answers.length >= 5 && !player.badges.some(b => b.id === 'perfect_game')) {
      earnedBadges.push({ 
        id: 'perfect_game', 
        name: 'Sans faute', 
        icon: '🎯', 
        description: 'Partie parfaite sans aucune erreur', 
        earnedAt: new Date() 
      });
    }

    if (player.xp >= 500 && totalXp >= 1000 && !player.badges.some(b => b.id === 'xp_1000')) {
      earnedBadges.push({ 
        id: 'xp_1000', 
        name: 'Millnaire', 
        icon: '🏆', 
        description: 'Accumuler 1000 XP au total', 
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