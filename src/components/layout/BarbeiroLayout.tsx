import { Outlet } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import MobileNav from './MobileNav';
import { LayoutDashboard, CalendarDays, UserPlus, History, DollarSign, User } from 'lucide-react';

const barbeiroNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/barbeiro/dashboard' },
  { icon: CalendarDays, label: 'Agenda', path: '/barbeiro/agenda' },
  { icon: UserPlus, label: 'Atendimento', path: '/barbeiro/atendimento-manual' },
  { icon: History, label: 'Histórico', path: '/barbeiro/historico' },
  { icon: DollarSign, label: 'Ganhos', path: '/barbeiro/ganhos' },
  { icon: User, label: 'Perfil', path: '/barbeiro/perfil' },
];

const BarbeiroLayout = () => {
  return (
    <div className="min-h-screen">
      <DesktopSidebar items={barbeiroNav} />
      <div className="md:pl-72">
        <main className="min-h-screen pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileNav items={barbeiroNav} />
    </div>
  );
};

export default BarbeiroLayout;
