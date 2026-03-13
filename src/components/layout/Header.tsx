import logo from '@/assets/logo-vivaz.png';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-3">
          <img src={logo} alt="Vivaz Barbearia" className="h-10 w-10 object-contain" />
          <span className="font-heading text-lg font-bold text-gradient-gold">VIVAZ</span>
        </button>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button
                onClick={() => navigate('/perfil')}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <User size={20} />
              </button>
              <button
                onClick={() => signOut()}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:text-destructive"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
