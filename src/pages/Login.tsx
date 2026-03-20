import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Loader2, Crown } from 'lucide-react';
import { getRoleHome } from '@/components/auth/ProtectedRoute';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, user, profile } = useAuth();
  const navigate = useNavigate();

  // Se já está logado e tem perfil, redireciona para o dashboard correto
  useEffect(() => {
    if (user && profile) {
      navigate(getRoleHome(profile.role), { replace: true });
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError('Email ou senha incorretos.');
    }
    setLoading(false);
    // Redirect is handled by the useEffect watching user/profile
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <Crown size={28} className="text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-gradient-gold">VIVAZ</h1>
          <p className="mt-1 text-sm text-muted-foreground">Barbearia Avenue</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-6 text-center font-heading text-xl font-semibold text-foreground">Entrar na sua conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
              </div>
            </div>

            <div className="text-right">
              <Link to="/recover" className="text-xs text-primary hover:underline">Esqueci minha senha</Link>
            </div>

            {error && <p className="rounded-lg bg-destructive/10 p-3 text-center text-xs text-destructive">{error}</p>}

            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              ENTRAR
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="gold-outline" size="lg" className="w-full" onClick={signInWithGoogle}>
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Entrar com Google
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
