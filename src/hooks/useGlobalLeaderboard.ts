import { useState, useEffect } from 'react';
import { supabase, AUTH_SERVICE } from '../services/authService';

export function useGlobalLeaderboard() {
  const [entries, setEntries] = useState<{ id: string; username: string; score: number; createdAt: string }[]>([]);
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
  const [results, setResults] = useState<{ id: string; username: string; score: number; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string; score: number; createdAt: string } | null>(null);

  const sanitizeSearchQuery = (input: string): string => {
    return input
      .trim()
      .replace(/[<>'"&;\\]/g, '')
      .slice(0, 50);
  };

  useEffect(() => {
    const sanitizedQuery = sanitizeSearchQuery(query);
    if (sanitizedQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .ilike('username', `%${sanitizedQuery}%`)
          .order('score', { ascending: false })
          .limit(10);

        if (error) throw error;
        setResults((data || []).map(d => ({
          id: d.id,
          username: d.username,
          score: d.score,
          createdAt: d.created_at || d.createdAt,
        })));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSetQuery = (input: string) => {
    setQuery(sanitizeSearchQuery(input));
  };

  return { query, setQuery: handleSetQuery, results, loading, selectedUser, setSelectedUser };
}