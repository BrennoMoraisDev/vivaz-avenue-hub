import { useState, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import GanhosCard from '@/components/barbeiro/GanhosCard';
import AgendaDayCard from '@/components/barbeiro/AgendaDayCard';
import { useBarbeiroProfile, useAgendamentosDoDia, useGanhos, updateAgendamentoStatus } from '@/hooks/useBarbeiro';
import { useAuth } from '@/hooks/useAuth';
import type { AgendamentoStatus } from '@/types/database.types';
import { CalendarDays, DollarSign, Scissors, TrendingUp, Users, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const BarbeiroDashboard = () => {
  const { profile } = useAuth();
  const { barbeiro, loading: loadB } = useBarbeiroProfile();
  const hoje = new Date().toISOString().split('T')[0];
  const { agendamentos, loading: loadA, refetch } = useAgendamentosDoDia(barbeiro?.id, hoje);
  const { ganhos, loading: loadG } = useGanhos(barbeiro?.id, barbeiro?.comissao || 50);

  const horaAtual = useMemo(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }, []);

  const proximos = useMemo(() =>
    agendamentos
      .filter(a => a.hora >= horaAtual && ['agendado', 'confirmado'].includes(a.status))
      .slice(0, 3),
    [agendamentos, horaAtual]
  );

  const handleStatus = async (id: string, status: AgendamentoStatus) => {
    const { error } = await updateAgendamentoStatus(id, status);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Status atualizado' });
      refetch();
    }
  };

  if (loadB) return (
    <PageContainer title="Dashboard">
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </PageContainer>
  );

  return (
    <PageContainer title="Dashboard" subtitle={`Olá, ${profile?.nome || barbeiro?.nome || 'Barbeiro'}`}>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GanhosCard icon={DollarSign} label="Ganhos hoje" value={fmt(ganhos.hoje)} />
        <GanhosCard icon={TrendingUp} label="Ganhos da semana" value={fmt(ganhos.semana)} />
        <GanhosCard icon={CalendarDays} label="Ganhos do mês" value={fmt(ganhos.mes)} />
        <GanhosCard icon={Scissors} label="Atendimentos hoje" value={String(ganhos.atendimentosHoje)} />
      </div>

      {/* Agenda do dia */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Agenda do dia</h2>
        {loadA ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : agendamentos.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <CalendarDays size={48} className="mx-auto mb-4 text-primary/30" />
            <p className="text-muted-foreground">Nenhum agendamento para hoje.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agendamentos.map(a => (
              <AgendaDayCard key={a.id} agendamento={a} onStatusChange={handleStatus} />
            ))}
          </div>
        )}
      </div>

      {/* Próximos */}
      {proximos.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Próximos atendimentos</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {proximos.map(a => (
              <div key={a.id} className="glass rounded-2xl p-4">
                <p className="text-primary font-heading font-bold text-lg">{a.hora?.slice(0, 5)}</p>
                <p className="text-sm text-foreground">{a.clientes?.nome}</p>
                <p className="text-xs text-muted-foreground">{a.servicos?.nome}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default BarbeiroDashboard;
