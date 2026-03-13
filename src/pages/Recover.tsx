import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo-vivaz.png';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

const Recover = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await resetPassword(email);
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="Vivaz" className="h-24 w-24 object-contain" />
          <h1 className="font-heading text-2xl font-bold text-gradient-gold">Recuperar Senha</h1>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle size={48} className="text-primary" />
            <p className="text-foreground">Email enviado! Verifique sua caixa de entrada.</p>
            <Link to="/login" className="text-sm text-primary hover:underline">Voltar ao login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="email" placeholder="Seu email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
              {loading && <Loader2 size={18} className="animate-spin" />}
              Enviar link
            </button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">Voltar ao login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Recover;
