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

const ADMIN_EMAILS = ['breno_fsa@yahoo.com', 'brennomoraisdev@gmail.com'];

function applyAdminRole(profile: UserProfile, email?: string | null): UserProfile {
  if (email && ADMIN_EMAILS.includes(email)) {
    return { ...profile, role: 'admin' as UserRole };
  }
  return profile;
}

async function fetchOrCreateProfile(userId: string, authUser: User): Promise<UserProfile | null> {
  // Step 1: Try to fetch existing profile
  const { data: existing, error: fetchError } = await supabase
    .from('perfis')
    .select('id, nome, telefone, role, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching profile:', fetchError.message);
    return null;
  }

  if (existing) {
    // Garantir que o registro de cliente existe (caso a trigger não tenha sido executada)
    if (existing.role === 'cliente') {
      setTimeout(async () => {
        try {
          await supabase.from('clientes').insert({
            id: userId,
            nome: existing.nome,
            telefone: existing.telefone,
            user_id: userId,
          } as any).select().maybeSingle();
        } catch (_) {
          // Ignore - may already exist (ON CONFLICT handled by DB)
        }
      }, 200);
    }
    return applyAdminRole(existing as UserProfile, authUser.email);
  }

  // Step 2: Create new profile
  const nome = authUser.user_metadata?.full_name || authUser.user_metadata?.nome || authUser.email?.split('@')[0] || 'Usuário';
  const telefone = authUser.user_metadata?.telefone || null;
  const role: UserRole = (authUser.email && ADMIN_EMAILS.includes(authUser.email)) ? 'admin' : 'cliente';

  const { data: created, error: insertError } = await supabase
    .from('perfis')
    .insert({ id: userId, nome, telefone, role, avatar_url: authUser.user_metadata?.avatar_url || null } as any)
    .select('id, nome, telefone, role, avatar_url')
    .maybeSingle();

  if (insertError) {
    // Race condition - try fetching again
    const { data: retry } = await supabase
      .from('perfis')
      .select('id, nome, telefone, role, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    return retry ? applyAdminRole(retry as UserProfile, authUser.email) : null;
  }

  if (created) {
    // Create cliente record in background (don't await, don't block login)
    setTimeout(async () => {
      try {
        await supabase.from('clientes').insert({
          id: userId,
          nome,
          telefone,
          user_id: userId,
        } as any);
      } catch (_) {
        // Ignore - may already exist
      }
    }, 100);
    return applyAdminRole(created as UserProfile, authUser.email);
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const handleSession = async (session: Session | null) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const p = await fetchOrCreateProfile(session.user.id, session.user);
        if (mounted) setProfile(p);
      } else {
        if (mounted) setProfile(null);
      }

      if (mounted) setLoading(false);
    };

    // Get current session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Then listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        handleSession(session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('perfis')
      .select('id, nome, telefone, role, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    if (data) setProfile(applyAdminRole(data as UserProfile, user.email));
  };

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
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
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
