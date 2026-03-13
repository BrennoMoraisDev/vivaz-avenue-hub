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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-all ${
                isActive ? 'text-primary scale-105' : 'text-muted-foreground'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && <div className="mt-0.5 h-0.5 w-4 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
