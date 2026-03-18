import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/database.types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
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
      // Se não tem perfil, não podemos verificar a role. 
      // Para segurança, redirecionamos para o login ou mostramos erro.
      // Mas como o usuário acabou de logar, talvez o perfil ainda esteja carregando.
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      );
    }
    if (!allowedRoles.includes(profile.role!)) {
      const roleHome = getRoleHome(profile.role);
      return <Navigate to={roleHome} replace />;
    }
  }

  // Redirect to profile edit on first access if telefone is not set (except when already on perfil page)
  if (profile && !profile.telefone && !location.pathname.includes('/perfil')) {
    const roleBase = profile.role === 'admin' ? '/admin' : 
                     profile.role === 'barbeiro' ? '/barbeiro' : '/cliente';
    return <Navigate to={`${roleBase}/perfil`} replace />;
  }

  return <>{children}</>;
}

export function getRoleHome(role: UserRole | null | undefined): string {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'barbeiro': return '/barbeiro/dashboard';
    case 'cliente':
    default: return '/cliente/dashboard';
  }
}
