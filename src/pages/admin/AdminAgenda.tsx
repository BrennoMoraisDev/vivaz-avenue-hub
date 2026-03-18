import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useAdminAgenda, useBarbeiros, type AgendamentoAdmin } from '@/hooks/useAdmin';
import StatusBadge from '@/components/barbeiro/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarDays, Eye, MessageCircle } from 'lucide-react';
import type { AgendamentoStatus } from '@/types/database.types';
import { motion } from 'framer-motion';
import { linkConfirmacaoWhatsApp, abrirWhatsApp } from '@/lib/whatsapp';

const STATUS_OPTIONS: AgendamentoStatus[] = ['agendado', 'confirmado', 'em atendimento', 'finalizado', 'cancelado', 'faltou'];

const AdminAgenda = () => {
  const hoje = new Date().toISOString().split('T')[0];
  const [barbeiroId, setBarbeiroId] = useState('');
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  const [statusFilter, setStatusFilter] = useState('todos');

  const { agendamentos, loading, atualizarStatus } = useAdminAgenda({
    barbeiroId: barbeiroId || undefined,
    dataInicio,
    dataFim,
    status: statusFilter,
  });
  const { barbeiros } = useBarbeiros();
  const { toast } = useToast();
  const [detalhes, setDetalhes] = useState<AgendamentoAdmin | null>(null);

  const handleStatusChange = async (id: string, status: AgendamentoStatus) => {
    const { error } = await atualizarStatus(id, status);
    if (error) toast({ title: 'Erro', variant: 'destructive' });
    else toast({ title: `Status alterado para "${status}"` });
  };

  const handleWhatsApp = (ag: AgendamentoAdmin) => {
    if (!ag.clientes?.telefone) {
      toast({ title: 'Cliente sem telefone cadastrado', variant: 'destructive' });
      return;
    }
    const link = linkConfirmacaoWhatsApp({
      clienteNome: ag.clientes.nome || 'Cliente',
      clienteTelefone: ag.clientes.telefone,
      barbeiroNome: ag.barbeiros?.nome || 'Barbeiro',
      servicoNome: ag.servicos?.nome || 'Serviço',
      data: ag.data,
      hora: ag.hora,
      barbeariaNome: 'Vivaz Barbearia Avenue',
    });
    abrirWhatsApp(link);
  };

  return (
    <PageContainer title="Agenda Geral" subtitle="Todos os agendamentos da barbearia">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap mb-6">
        <div>
          <label className="text-xs text-muted-foreground">Barbeiro</label>
          <select
            value={barbeiroId}
            onChange={(e) => setBarbeiroId(e.target.value)}
            className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1 text-foreground"
          >
            <option value="">Todos</option>
            {barbeiros.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">De</label>
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Até</label>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1 text-foreground"
          >
            <option value="todos">Todos</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Contador */}
      {!loading && agendamentos.length > 0 && (
        <p className="text-xs text-muted-foreground mb-3">
          {agendamentos.length} agendamento{agendamentos.length !== 1 ? 's' : ''} encontrado{agendamentos.length !== 1 ? 's' : ''}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : agendamentos.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <CalendarDays size={48} className="mx-auto mb-4 text-primary/40" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Nenhum agendamento encontrado</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {agendamentos.map((ag, i) => (
            <motion.div
              key={ag.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-center min-w-[60px]">
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(ag.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                  <p className="font-heading text-lg font-bold text-primary">{ag.hora?.slice(0, 5)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ag.clientes?.nome || 'Cliente'}</p>
                  <p className="text-xs text-muted-foreground">{ag.servicos?.nome} • {ag.barbeiros?.nome || 'Barbeiro'}</p>
                  {ag.servicos?.preco && (
                    <p className="text-xs text-primary font-semibold">R$ {ag.servicos.preco.toFixed(2).replace('.', ',')}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={ag.status} />
                <select
                  value={ag.status}
                  onChange={(e) => handleStatusChange(ag.id, e.target.value as AgendamentoStatus)}
                  className="rounded-lg border border-input bg-background px-2 py-1 text-xs text-foreground"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleWhatsApp(ag)}
                  title="Enviar confirmação via WhatsApp"
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                >
                  <MessageCircle size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDetalhes(ag)}>
                  <Eye size={14} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detalhes Modal */}
      <Dialog open={!!detalhes} onOpenChange={() => setDetalhes(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detalhes do Agendamento</DialogTitle></DialogHeader>
          {detalhes && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground text-xs">Data</span><p className="font-medium">{detalhes.data}</p></div>
                <div><span className="text-muted-foreground text-xs">Hora</span><p className="font-medium">{detalhes.hora?.slice(0, 5)}</p></div>
                <div><span className="text-muted-foreground text-xs">Cliente</span><p className="font-medium">{detalhes.clientes?.nome || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Telefone</span><p className="font-medium">{detalhes.clientes?.telefone || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Serviço</span><p className="font-medium">{detalhes.servicos?.nome || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Valor</span><p className="font-medium text-primary">R$ {(detalhes.servicos?.preco ?? 0).toFixed(2).replace('.', ',')}</p></div>
                <div><span className="text-muted-foreground text-xs">Barbeiro</span><p className="font-medium">{detalhes.barbeiros?.nome || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Status</span><StatusBadge status={detalhes.status} /></div>
              </div>
              {detalhes.observacao && (
                <div className="glass rounded-xl p-3">
                  <span className="text-xs text-muted-foreground">Observação</span>
                  <p className="mt-1">{detalhes.observacao}</p>
                </div>
              )}
              {detalhes.clientes?.telefone && (
                <Button
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleWhatsApp(detalhes)}
                >
                  <MessageCircle size={16} />
                  Enviar Confirmação via WhatsApp
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default AdminAgenda;
