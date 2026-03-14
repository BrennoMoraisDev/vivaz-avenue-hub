import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import BarberCard from '@/components/cliente/BarberCard';
import { mockBarbeiros } from '@/data/mockData';

const ClienteBarbeiros = () => {
  const navigate = useNavigate();
  const barbeirosAtivos = mockBarbeiros.filter(b => b.ativo);

  return (
    <PageContainer title="Barbeiros" subtitle="Conheça nossa equipe de especialistas">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {barbeirosAtivos.map(b => (
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
