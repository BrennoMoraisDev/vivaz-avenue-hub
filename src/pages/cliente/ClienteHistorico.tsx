import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import AppointmentCard from '@/components/cliente/AppointmentCard';
import { useAgendamentosCliente } from '@/hooks/useAgendamentos';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { AgendamentoStatus } from '@/types/database.types';

const statusFilters: { label: string; value: AgendamentoStatus | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Agendados', value: 'agendado' },
  { label: 'Confirmados', value: 'confirmado' },
  { label: 'Finalizados', value: 'finalizado' },
  { label: 'Cancelados', value: 'cancelado' },
];

const ClienteHistorico = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [filtro, setFiltro] = useState<AgendamentoStatus | 'todos'>('todos');
  const { agendamentos, loading, cancelarAgendamento } = useAgendamentosCliente({ status: filtro });

  const handleCancelar = async (id: string) => {
    const { error } = await cancelarAgendamento(id);
    if (error) {
      toast({ title: 'Erro ao cancelar', description: (error as any).message, variant: 'destructive' });
    } else {
      toast({ title: 'Agendamento cancelado', description: 'Seu agendamento foi cancelado com sucesso.' });
    }
  };

  const handleAvaliar = (agendamentoId: string) => {
    navigate(`/cliente/avaliar/${agendamentoId}`);
  };

  return (
    <PageContainer title="Histórico" subtitle="Seus agendamentos anteriores e próximos">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              filtro === f.value ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : agendamentos.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agendamentos.map(a => (
            <AppointmentCard
              key={a.id}
              agendamento={a}
              hasAvaliacao={false}
              onCancelar={handleCancelar}
              onAvaliar={handleAvaliar}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado.</p>
        </div>
      )}
    </PageContainer>
  );
};

export default ClienteHistorico;
