import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DesktopSidebar from './DesktopSidebar';
import MobileNav from './MobileNav';
import { Home, CalendarDays, Scissors, Clock, User } from 'lucide-react';

const clienteNav = [
  { icon: Home, label: 'Início', path: '/cliente/dashboard' },
  { icon: CalendarDays, label: 'Agendar', path: '/cliente/agendar' },
  { icon: Scissors, label: 'Serviços', path: '/cliente/servicos' },
  { icon: Clock, label: 'Histórico', path: '/cliente/historico' },
  { icon: User, label: 'Perfil', path: '/cliente/perfil' },
];

const ClienteLayout = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Removido redirecionamento forçado para permitir navegação livre
  // O telefone será solicitado apenas se necessário no momento do agendamento
  useEffect(() => {
    // Apenas log de depuração se necessário
  }, [profile, location.pathname]);

  return (
    <div className="min-h-screen">
      <DesktopSidebar items={clienteNav} />
      <div className="md:pl-72">
        <main className="min-h-screen pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileNav items={clienteNav} />
    </div>
  );
};

export default ClienteLayout;
