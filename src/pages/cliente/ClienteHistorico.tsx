import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import AppointmentCard from '@/components/cliente/AppointmentCard';
import { mockAgendamentos, mockAvaliacoes } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
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
  const [filtro, setFiltro] = useState<AgendamentoStatus | 'todos'>('todos');

  const agendamentos = mockAgendamentos
    .filter(a => filtro === 'todos' || a.status === filtro)
    .sort((a, b) => `${b.data}${b.hora}`.localeCompare(`${a.data}${a.hora}`));

  const handleCancelar = (id: string) => {
    // TODO: Update in Supabase
    toast({ title: 'Agendamento cancelado', description: 'Seu agendamento foi cancelado com sucesso.' });
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

      {agendamentos.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agendamentos.map(a => (
            <AppointmentCard
              key={a.id}
              agendamento={a}
              hasAvaliacao={mockAvaliacoes.some(av => av.agendamento_id === a.id)}
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
