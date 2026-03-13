import { Outlet } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import MobileNav from './MobileNav';
import { LayoutDashboard, Users, Clock } from 'lucide-react';

const barbeiroNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/barbeiro/dashboard' },
  { icon: Clock, label: 'Atendimentos', path: '/barbeiro/atendimentos' },
  { icon: Users, label: 'Clientes do dia', path: '/barbeiro/dashboard' },
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
