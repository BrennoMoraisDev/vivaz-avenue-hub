import { Outlet } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import MobileNav from './MobileNav';
import { CalendarDays, Users, Scissors, Tag, Settings, LayoutDashboard } from 'lucide-react';

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/agenda' },
  { icon: CalendarDays, label: 'Agenda', path: '/admin/agenda' },
  { icon: Users, label: 'Barbeiros', path: '/admin/barbeiros' },
  { icon: Scissors, label: 'Serviços', path: '/admin/servicos' },
  { icon: Tag, label: 'Categorias', path: '/admin/categorias' },
  { icon: Users, label: 'Clientes', path: '/admin/clientes' },
  { icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
];

const AdminLayout = () => {
  return (
    <div className="min-h-screen">
      <DesktopSidebar items={adminNav} />
      <div className="md:pl-72">
        <main className="min-h-screen pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileNav items={adminNav.slice(0, 5)} />
    </div>
  );
};

export default AdminLayout;
