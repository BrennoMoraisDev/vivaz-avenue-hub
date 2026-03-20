import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/database.types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(false);

  useEffect(() => {
    if (loading || !user || !profile) return;

    if (allowedRoles && !allowedRoles.includes(profile.role!)) {
      setCheckingRole(true);
      getRoleHome(profile.role, user.id).then(path => {
        setRedirectPath(path);
        setCheckingRole(false);
      });
    }
  }, [loading, user, profile, allowedRoles]);

  if (loading || checkingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    if (!profile) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      );
    }
    if (!allowedRoles.includes(profile.role!) && redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
}

export async function getRoleHome(role: UserRole | null | undefined, userId?: string): Promise<string> {
  // Se o usuário é admin, ir para admin
  if (role === 'admin') return '/admin/dashboard';
  
  // Se o usuário é barbeiro, ir para barbeiro
  if (role === 'barbeiro') return '/barbeiro/dashboard';
  
  // Se é cliente mas tem um perfil de barbeiro vinculado, ir para barbeiro
  if (userId) {
    try {
      const { data } = await supabase
        .from('barbeiros')
        .select('id')
        .eq('user_id', userId)
        .eq('ativo', true)
        .maybeSingle();
      if (data) return '/barbeiro/dashboard';
    } catch (_) {
      // Ignore errors
    }
  }
  
  // Default para cliente
  return '/cliente/dashboard';
}
