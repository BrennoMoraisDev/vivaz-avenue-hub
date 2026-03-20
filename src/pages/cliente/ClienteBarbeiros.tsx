import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import BarberCard from '@/components/cliente/BarberCard';
import { Button } from '@/components/ui/button';
import { useBarbeiros } from '@/hooks/useBarbeiros';
import { Loader2, AlertCircle } from 'lucide-react';

const ClienteBarbeiros = () => {
  const navigate = useNavigate();
  const { barbeiros, loading } = useBarbeiros();

  if (loading) {
    return (
      <PageContainer title="Barbeiros" subtitle="Conheça nossa equipe de especialistas">
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (barbeiros.length === 0) {
    return (
      <PageContainer title="Barbeiros" subtitle="Conheça nossa equipe de especialistas">
        <div className="glass rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-amber-500/50" />
          <p className="text-sm text-muted-foreground mb-2">Nenhum barbeiro cadastrado</p>
          <p className="text-xs text-muted-foreground">O administrador ainda não cadastrou barbeiros. Tente novamente mais tarde.</p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/cliente')}>
            Voltar ao início
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Barbeiros" subtitle="Conheça nossa equipe de especialistas">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {barbeiros.map(b => (
          <BarberCard
            key={b.id}
            barbeiro={b}
            onAgendar={(id) => navigate(`/cliente/agendar?barbeiro=${id}`)}
          />
        ))}
      </div>
    </PageContainer>
  );
};

export default ClienteBarbeiros;
