import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/authService';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  totalScore: number;
  xp: number;
  level: number;
  date: string;
  gameMode: string;
}

const LEADERBOARD_KEY = 'quiz_leaderboard';
const MAX_ENTRIES = 10;

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(MAX_ENTRIES);
      
      if (error) throw error;
      
      const entries = (data || []).map((d: { user_id: string; username: string; score: number; total_score: number; created_at: string }) => ({
        id: d.user_id,
        name: d.username,
        score: d.score,
        totalScore: d.total_score || 0,
        xp: 0,
        level: 1,
        date: d.created_at,
        gameMode: 'quiz',
      }));
      
      setEntries(entries);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    } catch (err) {
      console.error('Leaderboard error:', err);
      const saved = localStorage.getItem(LEADERBOARD_KEY);
      if (saved) {
        try {
          setEntries(JSON.parse(saved));
        } catch {
          setEntries([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFromSupabase();
  }, []);

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

  return { entries, loading, saveScore, clearLeaderboard, getRank, refresh: loadFromSupabase };
}