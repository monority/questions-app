import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

const BLOCKED_WORDS = [
  'pute', 'con', 'connard', 'encul', 'salop', 'merd', 'nul', 'chi', 'pdp',
  'bite', 'fdp', 'ntm', 'pd', 'tg', 'ntma', 'va', 'cte', 'suce', 'couille',
  'queue', 'chatte', 'teub', 'tub', 'fesse', 'ass', 'nig', 'nigga',
  'nigger', 'hitler', 'naz', 'kkk', 'racist', 'pedo', 'pedophile',
  'rape', 'viol', 'spam', 'hack'
];

const DEFAULT_USERNAME = 'Joueur';

interface SupabaseProfile {
  id: string;
  email: string;
  username: string;
  total_score: number;
  games_played: number;
  best_score: number;
  created_at: string;
}

function mapProfileFromSupabase(data: SupabaseProfile | null): UserProfile | null {
  if (!data) return null;
  return {
    id: data.id,
    email: data.email,
    username: data.username,
    totalScore: data.total_score ?? 0,
    gamesPlayed: data.games_played ?? 0,
    bestScore: data.best_score ?? 0,
    createdAt: data.created_at ?? new Date().toISOString(),
  };
}

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
  totalScore: number;
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
    if (data?.user) {
      await this.getOrCreateProfile(data.user.id, email, username);
    }
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

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
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

  async createProfile(userId: string, username: string, email: string) {
    const safeUsername = this.sanitizeUsername(username) || DEFAULT_USERNAME;
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: safeUsername,
        email,
        total_score: 0,
        games_played: 0,
        best_score: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return mapProfileFromSupabase(data as SupabaseProfile);
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return mapProfileFromSupabase(data as SupabaseProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  },

  async getOrCreateProfile(userId: string, email: string, username: string): Promise<UserProfile | null> {
    const existing = await this.getProfile(userId);
    if (existing) return existing;
    
    return this.createProfile(userId, username || email.split('@')[0], email);
  },

  sanitizeUsername(input: string): string {
    const cleaned = input.trim().slice(0, 20);
    const lower = cleaned.toLowerCase();
    for (const word of BLOCKED_WORDS) {
      if (lower.includes(word)) return DEFAULT_USERNAME;
    }
    return cleaned;
  },

  async submitScore(userId: string, score: number, username: string) {
    const safeUsername = this.sanitizeUsername(username);
    
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('total_score, games_played, best_score')
      .eq('id', userId)
      .single();
    
    if (fetchError) throw fetchError;

    const newTotalScore = (currentProfile?.total_score || 0) + score;
    const newGamesPlayed = (currentProfile?.games_played || 0) + 1;
    const newBestScore = Math.max(currentProfile?.best_score || 0, score);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        total_score: newTotalScore,
        games_played: newGamesPlayed,
        best_score: newBestScore,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    const { data: existing } = await supabase
      .from('leaderboard')
      .select('score')
      .eq('user_id', userId)
      .single();
    
    if (!existing || newBestScore > existing.score) {
      const { error: upsertError } = await supabase
        .from('leaderboard')
        .upsert({
          user_id: userId,
          username: safeUsername || DEFAULT_USERNAME,
          score: newBestScore,
          total_score: newTotalScore,
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        });
      
      if (upsertError) throw upsertError;
    } else if (currentProfile) {
      const { error: updateTotalError } = await supabase
        .from('leaderboard')
        .update({ total_score: newTotalScore })
        .eq('user_id', userId);
      
      if (updateTotalError) throw updateTotalError;
    }

    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select()
      .eq('id', userId)
      .single();

    return { 
      leaderboard: null, 
      profile: mapProfileFromSupabase(updatedProfile as SupabaseProfile) 
    };
  },

  async getGlobalLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []).map(d => ({
      id: d.user_id,
      userId: d.user_id,
      username: d.username,
      score: d.score,
      totalScore: d.total_score || 0,
      createdAt: d.created_at,
    }));
  },

  async getUserRank(userId: string): Promise<number> {
    const { data: userScore } = await supabase
      .from('leaderboard')
      .select('score')
      .eq('user_id', userId)
      .single();
    
    const userBestScore = userScore?.score || 0;
    
    const { data, error } = await supabase
      .from('leaderboard')
      .select('score', { count: 'exact', head: false })
      .gt('score', userBestScore);
    
    if (error) return 0;
    return (data?.length || 0) + 1;
  },
} as const;