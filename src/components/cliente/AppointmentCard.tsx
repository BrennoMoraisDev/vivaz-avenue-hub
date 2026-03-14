import { Calendar, Clock, User, Scissors, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getServicoById, getBarbeiroById, formatPreco } from '@/data/mockData';
import type { AgendamentoStatus } from '@/types/database.types';

interface AppointmentCardProps {
  agendamento: {
    id: string;
    barbeiro_id: string;
    servico_id: string;
    data: string;
    hora: string;
    status: AgendamentoStatus;
    observacao: string | null;
  };
  hasAvaliacao?: boolean;
  onCancelar?: (id: string) => void;
  onAvaliar?: (id: string) => void;
}

const statusConfig: Record<AgendamentoStatus, { label: string; className: string }> = {
  'agendado': { label: 'Agendado', className: 'bg-primary/15 text-primary border-primary/30' },
  'confirmado': { label: 'Confirmado', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  'em atendimento': { label: 'Em Atendimento', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  'finalizado': { label: 'Finalizado', className: 'bg-muted text-muted-foreground border-border' },
  'cancelado': { label: 'Cancelado', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  'faltou': { label: 'Faltou', className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
};

const AppointmentCard = ({ agendamento, hasAvaliacao, onCancelar, onAvaliar }: AppointmentCardProps) => {
  const servico = getServicoById(agendamento.servico_id);
  const barbeiro = getBarbeiroById(agendamento.barbeiro_id);
  const status = statusConfig[agendamento.status];

  const dataFormatada = new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div className="glass rounded-2xl p-5 transition-all duration-300 hover:shadow-gold/10">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-sm font-semibold text-foreground truncate">
            {servico?.nome || 'Serviço'}
          </h3>
          {servico?.preco != null && (
            <span className="text-xs font-semibold text-primary">{formatPreco(servico.preco)}</span>
          )}
        </div>
        <Badge variant="outline" className={`shrink-0 text-[10px] ${status.className}`}>
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <User size={12} className="text-primary/60" />
          <span className="truncate">{barbeiro?.nome || 'Barbeiro'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-primary/60" />
          <span>{dataFormatada}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-primary/60" />
          <span>{agendamento.hora.slice(0, 5)}</span>
        </div>
        {agendamento.observacao && (
          <div className="flex items-center gap-1.5 col-span-2">
            <MessageSquare size={12} className="text-primary/60 shrink-0" />
            <span className="truncate">{agendamento.observacao}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {agendamento.status === 'agendado' && onCancelar && (
          <Button variant="destructive" size="sm" className="flex-1 text-xs" onClick={() => onCancelar(agendamento.id)}>
            Cancelar
          </Button>
        )}
        {agendamento.status === 'finalizado' && !hasAvaliacao && onAvaliar && (
          <Button variant="gold-outline" size="sm" className="flex-1 text-xs" onClick={() => onAvaliar(agendamento.id)}>
            ⭐ Avaliar
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
