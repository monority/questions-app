import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  totalScore: number;
  gamesPlayed: number;
  bestScore: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  score: number;
  createdAt: string;
}

export const AUTH_SERVICE = {
  async signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async updateUsername(username: string) {
    const { data, error } = await supabase.auth.updateUser({
      data: { username }
    });
    if (error) throw error;
    return data;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async submitScore(userId: string, score: number, username: string) {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert({
        user_id: userId,
        username,
        score,
      })
      .select();
    
    if (error) throw error;
    return data;
  },

  async getGlobalLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async getUserRank(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('score', { count: 'exact', head: false })
      .gt('score', (
        await supabase.from('leaderboard').select('score').eq('user_id', userId).single()
      ).data?.score || 0);
    
    if (error) throw error;
    return data?.length || 0;
  },
} as const;