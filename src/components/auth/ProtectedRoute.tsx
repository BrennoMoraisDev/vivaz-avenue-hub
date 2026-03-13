import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/database.types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

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

  if (allowedRoles && profile && !allowedRoles.includes(profile.role!)) {
    // Redirect to proper area based on role
    const roleHome = getRoleHome(profile.role);
    return <Navigate to={roleHome} replace />;
  }

  return <>{children}</>;
}

export function getRoleHome(role: UserRole | null | undefined): string {
  switch (role) {
    case 'admin': return '/admin/agenda';
    case 'barbeiro': return '/barbeiro/dashboard';
    case 'cliente':
    default: return '/cliente/agenda';
  }
}
