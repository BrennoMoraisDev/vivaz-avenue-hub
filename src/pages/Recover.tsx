import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, CheckCircle, Crown, ArrowLeft } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <Crown size={28} className="text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-gradient-gold">VIVAZ</h1>
          <p className="mt-1 text-sm text-muted-foreground">Recuperar acesso</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle size={28} className="text-primary" />
              </div>
              <h2 className="font-heading text-lg font-semibold text-foreground">Email enviado!</h2>
              <p className="text-sm text-muted-foreground">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
              <Link to="/login">
                <Button variant="gold-outline" size="default">
                  <ArrowLeft size={16} />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-center font-heading text-xl font-semibold text-foreground">Esqueceu a senha?</h2>
              <p className="mb-6 text-center text-sm text-muted-foreground">Informe seu email e enviaremos instruções para recuperação.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
                  </div>
                </div>
                {error && <p className="rounded-lg bg-destructive/10 p-3 text-center text-xs text-destructive">{error}</p>}
                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Enviar instruções
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">
            <ArrowLeft size={14} className="mr-1 inline" />
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Recover;
