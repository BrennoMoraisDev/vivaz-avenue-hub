import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import AgendaDayCard from '@/components/barbeiro/AgendaDayCard';
import StatusBadge from '@/components/barbeiro/StatusBadge';
import { useBarbeiroProfile, useAgendamentosFiltrados, updateAgendamentoStatus } from '@/hooks/useBarbeiro';
import type { AgendamentoStatus } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BarbeiroAgenda = () => {
  const { barbeiro, loading: loadB } = useBarbeiroProfile();
  const hoje = new Date().toISOString().split('T')[0];
  const [dataFiltro, setDataFiltro] = useState(hoje);
  const [statusFiltro, setStatusFiltro] = useState('todos');

  const { agendamentos, loading, refetch } = useAgendamentosFiltrados(barbeiro?.id, {
    dataInicio: dataFiltro,
    dataFim: dataFiltro,
    status: statusFiltro,
  });


  const handleStatus = async (id: string, status: AgendamentoStatus) => {
    const { error } = await updateAgendamentoStatus(id, status);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Status atualizado' });
      refetch();
    }
  };

  return (
    <PageContainer title="Agenda" subtitle="Visualize e gerencie seus agendamentos">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          type="date"
          value={dataFiltro}
          onChange={e => setDataFiltro(e.target.value)}
          className="w-auto"
        />
        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="em atendimento">Em atendimento</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
            <SelectItem value="faltou">Faltou</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading || loadB ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : agendamentos.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <CalendarDays size={48} className="mx-auto mb-4 text-primary/30" />
          <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agendamentos.map(a => (
            <AgendaDayCard key={a.id} agendamento={a} onStatusChange={handleStatus} />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default BarbeiroAgenda;
