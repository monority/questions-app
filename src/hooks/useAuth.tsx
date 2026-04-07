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
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user as AuthUser);
        let profileData = await AUTH_SERVICE.getProfile(session.user.id);
        if (!profileData) {
          try {
            const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Player';
            profileData = await AUTH_SERVICE.getOrCreateProfile(session.user.id, session.user.email || '', username);
          } catch (err) {
            console.warn('Profile creation failed:', err);
            profileData = null;
          }
        }
        setProfile(profileData);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user as AuthUser);
        let profileData = await AUTH_SERVICE.getProfile(session.user.id);
        if (!profileData) {
          try {
            const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Player';
            profileData = await AUTH_SERVICE.getOrCreateProfile(session.user.id, session.user.email || '', username);
          } catch (err) {
            console.warn('Profile creation failed:', err);
            profileData = null;
          }
        }
        setProfile(profileData);
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
    
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Player';
    let profileData;
    try {
      profileData = await AUTH_SERVICE.getOrCreateProfile(user.id, user.email || '', username);
    } catch (err) {
      console.warn('Profile creation failed:', err);
      profileData = null;
    }
    setProfile(profileData);
  }

  async function signUp(email: string, password: string, username: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        throw new Error('Vous avez déjà un compte. Déconnectez-vous d\'abord.');
      }
      await AUTH_SERVICE.signUp(email, password, username);
      await signIn(email, password);
    } catch (err) {
      console.error('Signup error:', err);
      if (err instanceof Error && (err.message.includes('already') || err.message.includes('Déconnectez'))) throw err;
      throw new Error('Erreur lors de l\'inscription');
    }
  }

  async function signOut() {
    await AUTH_SERVICE.signOut();
    setUser(null);
    setProfile(null);
  }

  async function resetPassword(email: string) {
    await AUTH_SERVICE.resetPassword(email);
  }

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id);
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, resetPassword, refreshProfile }}>
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