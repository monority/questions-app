import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, AUTH_SERVICE } from '../services/authService';

const SEARCH_DEBOUNCE_MS = 300;

export function useGlobalLeaderboard() {
  const [entries, setEntries] = useState<{ id: string; username: string; score: number; totalScore: number; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      setLoading(true);
      const data = await AUTH_SERVICE.getGlobalLeaderboard(50);
      setEntries(data.map(d => ({
        id: d.id,
        username: d.username,
        score: d.score,
        totalScore: d.totalScore,
        createdAt: d.createdAt,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  }

  return { entries, loading, error, refetch: loadEntries };
}

export function useUserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; username: string; score: number; totalScore: number; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string; score: number; totalScore: number; createdAt: string } | null>(null);
  const debounceRef = useRef<number | null>(null);

  const sanitizeSearchQuery = (input: string): string => {
    return input
      .trim()
      .replace(/[<>'"&;\\]/g, '')
      .slice(0, 50);
  };

  const performSearch = useCallback(async (sanitizedQuery: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('user_id, username, score, total_score')
        .ilike('username', `%${sanitizedQuery}%`)
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const resultsWithDates = await Promise.all((data || []).map(async (d) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', d.user_id)
          .single();
        return {
          id: d.user_id,
          username: d.username,
          score: d.score,
          totalScore: d.total_score || 0,
          createdAt: profile?.created_at || new Date().toISOString(),
        };
      }));
      
      setResults(resultsWithDates);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sanitizedQuery = sanitizeSearchQuery(query);
    if (sanitizedQuery.length < 2) {
      setResults([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      performSearch(sanitizedQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, performSearch]);

  const handleSetQuery = (input: string) => {
    setQuery(sanitizeSearchQuery(input));
  };

  return { query, setQuery: handleSetQuery, results, loading, selectedUser, setSelectedUser };
}