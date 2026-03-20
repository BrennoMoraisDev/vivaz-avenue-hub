import { Outlet } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import MobileNav from './MobileNav';
import {
  CalendarDays, Users, Scissors, Tag, Settings,
  LayoutDashboard, CalendarOff, UserCircle, BarChart3, Star, Bell,
  Scissors as ScissorsIcon, User
} from 'lucide-react';

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: CalendarDays, label: 'Agenda', path: '/admin/agenda' },
  { icon: Users, label: 'Barbeiros', path: '/admin/barbeiros' },
  { icon: Scissors, label: 'Serviços', path: '/admin/servicos' },
  { icon: Tag, label: 'Categorias', path: '/admin/categorias' },
  { icon: Users, label: 'Clientes', path: '/admin/clientes' },
  { icon: Star, label: 'Fidelidade', path: '/admin/fidelidade' },
  { icon: Bell, label: 'Lembretes', path: '/admin/lembretes' },
  { icon: BarChart3, label: 'BI', path: '/admin/bi' },
  { icon: CalendarOff, label: 'Bloqueios', path: '/admin/bloqueios' },
  { icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
  { icon: UserCircle, label: 'Perfil', path: '/admin/perfil' },
  // Admin também acessa como barbeiro
  { icon: ScissorsIcon, label: 'Área Barbeiro', path: '/barbeiro/dashboard' },
  // Admin também acessa como cliente
  { icon: User, label: 'Área Cliente', path: '/cliente/dashboard' },
];

const AdminLayout = () => {
  return (
    <div className="min-h-screen">
      <DesktopSidebar items={adminNav} profilePath="/admin/perfil" />
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
