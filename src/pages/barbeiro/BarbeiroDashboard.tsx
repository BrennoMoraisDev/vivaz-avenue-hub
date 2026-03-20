import { useState, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import GanhosCard from '@/components/barbeiro/GanhosCard';
import AgendaDayCard from '@/components/barbeiro/AgendaDayCard';
import { SkeletonKPICard, SkeletonAppointmentCard } from '@/components/ui/SkeletonCard';
import { useBarbeiroProfile, useAgendamentosDoDia, useGanhos, updateAgendamentoStatus } from '@/hooks/useBarbeiro';
import { useAuth } from '@/hooks/useAuth';
import type { AgendamentoStatus } from '@/types/database.types';
import { CalendarDays, DollarSign, Scissors, TrendingUp, Clock, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { linkLembrete1HoraWhatsApp, abrirWhatsApp } from '@/lib/whatsapp';

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

  // Próximo cliente (o mais próximo do horário atual)
  const proximoCliente = proximos[0];

  const handleStatus = async (id: string, status: AgendamentoStatus) => {
    const { error } = await updateAgendamentoStatus(id, status);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Status atualizado' });
      refetch();
    }
  };

  const handleLembreteWhatsApp = (ag: any) => {
    if (!ag.clientes?.telefone) {
      toast({ title: 'Cliente sem telefone', variant: 'destructive' });
      return;
    }
    const link = linkLembrete1HoraWhatsApp(
      ag.clientes.nome || 'Cliente',
      ag.clientes.telefone,
      ag.hora,
      barbeiro?.nome || profile?.nome || 'Barbeiro',
      'Vivaz Barbearia Avenue'
    );
    abrirWhatsApp(link);
    toast({ title: 'WhatsApp aberto!', description: `Lembrete enviado para ${ag.clientes.nome}` });
  };

  const firstName = profile?.nome?.split(' ')[0] || barbeiro?.nome?.split(' ')[0] || 'Barbeiro';

  return (
    <PageContainer title="Dashboard" subtitle={`Olá, ${firstName}! Bom trabalho hoje 💈`}>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {loadB || loadG ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <GanhosCard icon={DollarSign} label="Ganhos hoje" value={fmt(ganhos.hoje)} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
              <GanhosCard icon={TrendingUp} label="Ganhos da semana" value={fmt(ganhos.semana)} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <GanhosCard icon={CalendarDays} label="Ganhos do mês" value={fmt(ganhos.mes)} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
              <GanhosCard icon={Scissors} label="Atendimentos hoje" value={String(ganhos.atendimentosHoje)} />
            </motion.div>
          </>
        )}
      </div>

      {/* Banner próximo cliente */}
      {!loadA && proximoCliente && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 glass rounded-2xl p-4 border border-primary/20 flex items-center justify-between gap-3"
          style={{ background: 'linear-gradient(135deg, hsl(43 65% 52% / 0.08), hsl(43 65% 52% / 0.03))' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 flex-shrink-0">
              <Clock size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-wide">Próximo cliente</p>
              <p className="text-sm font-bold text-foreground">{proximoCliente.clientes?.nome}</p>
              <p className="text-xs text-muted-foreground">
                {proximoCliente.hora?.slice(0, 5)} • {proximoCliente.servicos?.nome}
              </p>
            </div>
          </div>
          {proximoCliente.clientes?.telefone && (
            <Button
              size="sm"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
              onClick={() => handleLembreteWhatsApp(proximoCliente)}
            >
              <MessageCircle size={13} />
              Lembrar
            </Button>
          )}
        </motion.div>
      )}

      {/* Agenda do dia */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">Agenda de hoje</h2>
          {!loadA && agendamentos.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {agendamentos.filter(a => a.status === 'finalizado').length}/{agendamentos.length} finalizados
            </span>
          )}
        </div>

        {loadA ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <SkeletonAppointmentCard key={i} />)}
          </div>
        ) : agendamentos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-8 text-center"
          >
            <CalendarDays size={48} className="mx-auto mb-4 text-primary/30" />
            <p className="text-muted-foreground">Nenhum agendamento para hoje.</p>
            <p className="text-xs text-muted-foreground mt-1">Aproveite para descansar! 😄</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {agendamentos.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <AgendaDayCard agendamento={a} onStatusChange={handleStatus} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Próximos */}
      {!loadA && proximos.length > 1 && (
        <div className="mt-6">
          <h2 className="font-heading text-base font-semibold text-foreground mb-3">Em seguida</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {proximos.slice(1).map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-4"
              >
                <p className="text-primary font-heading font-bold text-lg">{a.hora?.slice(0, 5)}</p>
                <p className="text-sm font-medium text-foreground">{a.clientes?.nome}</p>
                <p className="text-xs text-muted-foreground">{a.servicos?.nome}</p>
                {a.servicos?.preco && (
                  <p className="text-xs text-primary font-semibold mt-1">R$ {a.servicos.preco.toFixed(2).replace('.', ',')}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default BarbeiroDashboard;
