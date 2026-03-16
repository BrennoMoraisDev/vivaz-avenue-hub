import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import BarberCard from '@/components/cliente/BarberCard';
import { useBarbeiros } from '@/hooks/useBarbeiros';
import { Loader2 } from 'lucide-react';

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
