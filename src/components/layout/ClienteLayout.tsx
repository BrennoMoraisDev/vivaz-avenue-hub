import { Outlet } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import MobileNav from './MobileNav';
import { Home, CalendarDays, Clock, User, Scissors } from 'lucide-react';

const clienteNav = [
  { icon: Home, label: 'Início', path: '/cliente/agenda' },
  { icon: CalendarDays, label: 'Agendar', path: '/cliente/agenda' },
  { icon: Scissors, label: 'Serviços', path: '/cliente/agenda' },
  { icon: Clock, label: 'Histórico', path: '/cliente/historico' },
  { icon: User, label: 'Perfil', path: '/cliente/perfil' },
];

const ClienteLayout = () => {
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
