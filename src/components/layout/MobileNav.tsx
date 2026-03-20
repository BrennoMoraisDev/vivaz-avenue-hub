import { useNavigate, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface MobileNavProps {
  items: NavItem[];
}

const MobileNav = ({ items }: MobileNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-1 py-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-2 transition-all duration-200 touch-feedback ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-bg"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className="relative z-10" />
              <span className="relative z-10 text-[10px] font-medium">{item.label}</span>
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-primary"
                  />
                )}
              </AnimatePresence>
            </button>
          );
        })}
        <div className="flex flex-col items-center gap-0.5 px-2 py-1">
          <ThemeToggle className="h-8 w-8 text-[10px]" />
          <span className="text-[10px] text-muted-foreground">Tema</span>
        </div>
      </div>
    </nav>
  );
};

export default MobileNav;
