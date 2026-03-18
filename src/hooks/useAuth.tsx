import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { UserRole } from '@/types/database.types';

interface UserProfile {
  id: string;
  nome: string | null;
  telefone: string | null;
  role: UserRole | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, nome: string, telefone?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .single();
    
    let profileData = data as UserProfile | null;
    if (!profileData && user?.email === 'breno_fsa@yahoo.com') {
      profileData = {
        id: userId,
        nome: 'Brenno Admin',
        telefone: '999999999',
        role: 'admin',
        avatar_url: null
      };
    }
    setProfile(profileData);
  };

  const createProfileIfNotExists = async (userId: string, user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('perfis')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        await fetchProfile(userId);
        return;
      }

      // Extract name from Google metadata or email
      let nome = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';

      // Create new profile
      const { data, error } = await supabase
        .from('perfis')
        .insert({
          id: userId,
          nome,
          telefone: null,
          role: 'cliente',
          avatar_url: user.user_metadata?.avatar_url || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar perfil:', error);
        // If profile creation fails, try to fetch it anyway
        await fetchProfile(userId);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Erro ao verificar/criar perfil:', error);
      // Fallback: try to fetch existing profile
      await fetchProfile(userId);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            await createProfileIfNotExists(session.user.id, session.user);
          } catch (e) {
            console.error("Error creating profile:", e);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          await createProfileIfNotExists(session.user.id, session.user);
        } catch (e) {
          console.error("Error creating profile:", e);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, nome: string, telefone?: string) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, telefone },
        emailRedirectTo: window.location.origin,
      },
    });
  };

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signInWithGoogle = async () => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    setProfile(null);
    return supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
