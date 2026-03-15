import { Badge } from '@/components/ui/badge';
import type { AgendamentoStatus } from '@/types/database.types';

const statusConfig: Record<AgendamentoStatus, { label: string; className: string }> = {
  'agendado': { label: 'Agendado', className: 'bg-primary/20 text-primary border-primary/30' },
  'confirmado': { label: 'Confirmado', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'em atendimento': { label: 'Em atendimento', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'finalizado': { label: 'Finalizado', className: 'bg-muted text-muted-foreground border-border' },
  'cancelado': { label: 'Cancelado', className: 'bg-destructive/20 text-destructive border-destructive/30' },
  'faltou': { label: 'Faltou', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
};

export default function StatusBadge({ status }: { status: AgendamentoStatus }) {
  const cfg = statusConfig[status] || statusConfig['agendado'];
  return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
}
