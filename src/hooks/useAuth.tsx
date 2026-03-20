import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
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

// Cache global para evitar múltiplas buscas simultâneas pelo mesmo perfil
const profileCache: Record<string, Promise<UserProfile | null>> = {};

async function fetchOrCreateProfile(userId: string, authUser: User): Promise<UserProfile | null> {
  // Se já houver uma busca em andamento para este usuário, retornar a mesma promessa
  if (profileCache[userId]) {
    return profileCache[userId];
  }

  const fetchPromise = (async () => {
    try {
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
        // Verificar se o usuário é um barbeiro (mesmo se o role for 'cliente')
        if (existing.role === 'cliente') {
          try {
            const { data: barberData } = await supabase
              .from('barbeiros')
              .select('id')
              .eq('user_id', userId)
              .eq('ativo', true)
              .maybeSingle();
            // Se for barbeiro, mudar o role para 'barbeiro'
            if (barberData) {
              existing.role = 'barbeiro' as UserRole;
              // Atualizar o perfil no banco de dados para refletir o novo role
              await supabase
                .from('perfis')
                .update({ role: 'barbeiro' })
                .eq('id', userId);
            }
          } catch (error) {
            console.error('Error checking barber profile:', error);
          }
          
          // Garantir que o registro de cliente existe (caso a trigger não tenha sido executada)
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
        // Create cliente record in background
        setTimeout(async () => {
          try {
            await supabase.from('clientes').insert({
              id: userId,
              nome,
              telefone,
              user_id: userId,
            } as any);
          } catch (_) {
            // Ignore
          }
        }, 100);
        return applyAdminRole(created as UserProfile, authUser.email);
      }

      return null;
    } finally {
      // Limpar o cache após a conclusão (opcional, ou manter por um tempo)
      // Aqui limpamos para permitir refreshProfile funcionar depois
      delete profileCache[userId];
    }
  })();

  profileCache[userId] = fetchPromise;
  return fetchPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const lastFetchedUserId = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleSession = async (currentSession: Session | null) => {
      if (!mounted) return;

      const currentUser = currentSession?.user ?? null;
      
      // Só atualiza estados básicos se houver mudança real
      setSession(currentSession);
      setUser(currentUser);

      if (currentUser) {
        // Evita buscar o perfil se já for o mesmo usuário e já tivermos o perfil
        if (lastFetchedUserId.current === currentUser.id && profile) {
          setLoading(false);
          return;
        }

        lastFetchedUserId.current = currentUser.id;
        const p = await fetchOrCreateProfile(currentUser.id, currentUser);
        
        if (mounted) {
          setProfile(p);
          setLoading(false);
        }
      } else {
        lastFetchedUserId.current = null;
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
      }
    };

    // Get current session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Then listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // Evita processar eventos repetitivos se a sessão for a mesma
        handleSession(session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [profile]); // Adicionado profile como dependência para a lógica de skip funcionar corretamente

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
    lastFetchedUserId.current = null;
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
