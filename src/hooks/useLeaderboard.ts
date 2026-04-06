import { useState, useCallback } from 'react';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  xp: number;
  level: number;
  date: string;
  gameMode: string;
}

const LEADERBOARD_KEY = 'quiz_leaderboard';
const MAX_ENTRIES = 10;

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const saveScore = useCallback((entry: Omit<LeaderboardEntry, 'date'>) => {
    const newEntry: LeaderboardEntry = {
      ...entry,
      date: new Date().toISOString(),
    };

    setEntries(prev => {
      const updated = [...prev, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_ENTRIES);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearLeaderboard = useCallback(() => {
    localStorage.removeItem(LEADERBOARD_KEY);
    setEntries([]);
  }, []);

  const getRank = useCallback((score: number): number => {
    const rank = entries.findIndex(e => score > e.score);
    return rank === -1 ? entries.length + 1 : rank + 1;
  }, [entries]);

  return { entries, saveScore, clearLeaderboard, getRank };
}