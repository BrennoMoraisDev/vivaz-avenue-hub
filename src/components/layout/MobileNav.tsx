import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Clock, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: CalendarDays, label: 'Agendar', path: '/agenda' },
  { icon: Clock, label: 'Histórico', path: '/historico' },
  { icon: User, label: 'Perfil', path: '/perfil' },
];

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
