import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import type { AgendamentoCompleto } from '@/hooks/useBarbeiro';
import type { AgendamentoStatus } from '@/types/database.types';
import { Play, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  agendamento: AgendamentoCompleto;
  onStatusChange: (id: string, status: AgendamentoStatus) => void;
}

export default function AgendaDayCard({ agendamento, onStatusChange }: Props) {
  const { id, hora, status, clientes, servicos, barbeiros } = agendamento;

  return (
    <div className="glass rounded-2xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Clock size={20} className="text-primary" />
        </div>
        <div>
          <p className="font-heading font-semibold text-foreground">
            {hora?.slice(0, 5)} — {clientes?.nome || 'Cliente'}
          </p>
          <p className="text-sm text-muted-foreground">{servicos?.nome || 'Serviço'}</p>
          {barbeiros?.nome && (
            <p className="text-xs text-muted-foreground/70">Barbeiro: {barbeiros.nome}</p>
          )}
          {servicos?.preco && (
            <p className="text-xs text-primary font-semibold">
              R$ {Number(servicos.preco).toFixed(2).replace('.', ',')}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
        {(status === 'agendado' || status === 'confirmado') && (
          <Button size="sm" variant="gold" onClick={() => onStatusChange(id, 'em atendimento')}>
            <Play size={14} /> Iniciar
          </Button>
        )}
        {status === 'em atendimento' && (
          <Button size="sm" variant="gold" onClick={() => onStatusChange(id, 'finalizado')}>
            <CheckCircle2 size={14} /> Concluir
          </Button>
        )}
      </div>
    </div>
  );
}
