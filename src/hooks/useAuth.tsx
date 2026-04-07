import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { supabase, AUTH_SERVICE, type UserProfile } from '../services/authService';

interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    username?: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user as AuthUser);
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user as AuthUser);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      const data = await AUTH_SERVICE.getProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async function signIn(email: string, password: string) {
    const { user } = await AUTH_SERVICE.signIn(email, password);
    setUser(user as AuthUser);
    await loadProfile(user.id);
  }

  async function signUp(email: string, password: string, username: string) {
    await AUTH_SERVICE.signUp(email, password, username);
    await signIn(email, password);
  }

  async function signOut() {
    await AUTH_SERVICE.signOut();
    setUser(null);
    setProfile(null);
  }

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id);
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}