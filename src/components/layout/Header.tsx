import logo from '@/assets/logo-vivaz.png';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <img src={logo} alt="Vivaz Barbearia" className="h-14 w-14 object-contain" />
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {[
            { label: 'Início', path: '/' },
            { label: 'Agendar', path: '/agenda' },
            { label: 'Histórico', path: '/historico' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="font-body text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => navigate('/perfil')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
              >
                <User size={18} />
              </button>
              <button
                onClick={() => signOut()}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="rounded-lg bg-primary px-6 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
            >
              Entrar
            </button>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground md:hidden"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          {[
            { label: 'Início', path: '/' },
            { label: 'Agendar', path: '/agenda' },
            { label: 'Histórico', path: '/historico' },
            { label: 'Perfil', path: '/perfil' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMenuOpen(false); }}
              className="block w-full py-3 text-left font-body text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
