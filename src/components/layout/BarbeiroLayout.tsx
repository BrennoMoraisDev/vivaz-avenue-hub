import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import MobileNav from './MobileNav';
import { LayoutDashboard, CalendarDays, UserPlus, History, DollarSign, User, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useBarbeiroProfile } from '@/hooks/useBarbeiro';
import { useAuth } from '@/hooks/useAuth';

const barbeiroNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/barbeiro/dashboard' },
  { icon: CalendarDays, label: 'Agenda', path: '/barbeiro/agenda' },
  { icon: UserPlus, label: 'Atendimento', path: '/barbeiro/atendimento-manual' },
  { icon: History, label: 'Histórico', path: '/barbeiro/historico' },
  { icon: DollarSign, label: 'Ganhos', path: '/barbeiro/ganhos' },
  { icon: User, label: 'Perfil', path: '/barbeiro/perfil' },
];

const BarbeiroLayout = () => {
  const { profile: authProfile } = useAuth();
  const { barbeiro, loading } = useBarbeiroProfile();
  const navigate = useNavigate();

  // Se for admin, permite acesso total sem restrição de status "ativo"
  const isAdmin = authProfile?.role === 'admin';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não for admin e o barbeiro estiver inativo ou não existir perfil vinculado
  if (!isAdmin && (!barbeiro || !barbeiro.ativo)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mx-auto mb-6">
            <Lock size={32} className="text-destructive" />
          </div>
          <h1 className="font-heading text-xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">
            Sua conta de barbeiro está inativa ou não possui um perfil vinculado. 
            Entre em contato com o administrador para ativar seu acesso.
          </p>
          <Navigate to="/login" replace />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DesktopSidebar items={barbeiroNav} />
      <div className="md:pl-72">
        {/* Botão de voltar para admin */}
        {isAdmin && (
          <div className="border-b border-border bg-card p-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar para Admin
            </button>
          </div>
        )}
        <main className="min-h-screen pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileNav items={barbeiroNav} />
    </div>
  );
};

export default BarbeiroLayout;
