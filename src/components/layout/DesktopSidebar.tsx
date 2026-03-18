import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Crown, LogOut, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { motion } from 'framer-motion';

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface DesktopSidebarProps {
  items: SidebarItem[];
  profilePath?: string;
}

const DesktopSidebar = ({ items, profilePath = '/cliente/perfil' }: DesktopSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const initials = profile?.nome
    ? profile.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
      {/* Brand */}
      <div className="flex h-20 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
          <Crown size={18} className="text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="font-heading text-lg font-bold text-gradient-gold">VIVAZ</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Barbearia Avenue</p>
        </div>
        <ThemeToggle />
      </div>

      {/* User */}
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.nome || 'Avatar'}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{profile?.nome || 'Usuário'}</p>
            <p className="text-xs capitalize text-muted-foreground">{profile?.role || 'cliente'}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {items.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 touch-feedback ${
                isActive
                  ? 'gold-border-left bg-primary/10 font-semibold text-primary'
                  : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
              }`}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-3 space-y-1">
        <button
          onClick={() => navigate(profilePath)}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-surface-hover hover:text-foreground touch-feedback"
        >
          <User size={18} />
          <span>Perfil</span>
        </button>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive touch-feedback"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
