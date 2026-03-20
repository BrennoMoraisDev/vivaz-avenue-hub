import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { useAdminMetrics } from '@/hooks/useAdmin';
import StatusBadge from '@/components/barbeiro/StatusBadge';
import {
  CalendarDays, DollarSign, Users, Scissors, TrendingUp,
  AlertTriangle, BarChart3, Star, Bell, ArrowRight, MessageCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { linkConfirmacaoWhatsApp, abrirWhatsApp } from '@/lib/whatsapp';

const COLORS = ['hsl(43,65%,52%)', 'hsl(43,65%,40%)', 'hsl(43,45%,55%)', 'hsl(43,35%,45%)', 'hsl(0,0%,50%)'];

// Skeleton para KPI cards
const KPISkeleton = () => (
  <div className="glass rounded-2xl p-5">
    <div className="flex items-center gap-3">
      <div className="skeleton-pulse h-10 w-10 rounded-xl" />
      <div className="space-y-2 flex-1">
        <div className="skeleton-pulse h-3 w-24 rounded" />
        <div className="skeleton-pulse h-6 w-16 rounded" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { metrics, agendamentosPorDia, servicosMaisRealizados, proximosAgendamentos, loading } = useAdminMetrics();

  const kpis = [
    {
      icon: DollarSign,
      label: 'Faturamento hoje',
      value: `R$ ${metrics.faturamentoHoje.toFixed(2).replace('.', ',')}`,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Faturamento do mês',
      value: `R$ ${metrics.faturamentoMes.toFixed(2).replace('.', ',')}`,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: CalendarDays,
      label: 'Agendamentos hoje',
      value: String(metrics.agendamentosHoje),
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Users,
      label: 'Clientes cadastrados',
      value: String(metrics.clientesCadastrados),
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      icon: Scissors,
      label: 'Barbeiros ativos',
      value: String(metrics.barbeirosAtivos),
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
  ];

  const quickLinks = [
    { icon: BarChart3, label: 'Inteligência de Negócio', path: '/admin/bi', desc: 'Mapa de calor e análises' },
    { icon: Star, label: 'Fidelidade', path: '/admin/fidelidade', desc: 'Programa de pontos' },
    { icon: Bell, label: 'Lembretes', path: '/admin/lembretes', desc: 'Clientes sumidos' },
  ];

  const handleWhatsApp = (ag: any) => {
    if (!ag.clientes?.telefone) return;
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
    <PageContainer title="Dashboard" subtitle="Visão geral da Vivaz Barbearia Avenue">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <KPISkeleton key={i} />)
          : kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>
                  <kpi.icon size={20} className={kpi.color} />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
                  <p className="font-heading text-xl font-bold text-foreground">{kpi.value}</p>
                </div>
              </div>
            </motion.div>
          ))
        }
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        {quickLinks.map((link, i) => (
          <motion.button
            key={link.path}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(link.path)}
            className="glass rounded-xl p-4 flex items-center gap-3 text-left hover:border-primary/30 transition-all group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <link.icon size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{link.label}</p>
              <p className="text-xs text-muted-foreground">{link.desc}</p>
            </div>
            <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Agendamentos por dia (7 dias)</h3>
          {loading ? (
            <div className="skeleton-pulse h-[220px] rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={agendamentosPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,14%)" vertical={false} />
                <XAxis dataKey="dia" tick={{ fill: 'hsl(0,0%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(0,0%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(0,0%,6%)',
                    border: '1px solid hsl(0,0%,14%)',
                    borderRadius: '0.75rem',
                    color: 'hsl(0,0%,96%)',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'hsl(43,65%,52%,0.05)' }}
                />
                <Bar dataKey="total" fill="hsl(43,65%,52%)" radius={[6, 6, 0, 0]} name="Agendamentos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Serviços mais realizados (mês)</h3>
          {loading ? (
            <div className="skeleton-pulse h-[220px] rounded-xl" />
          ) : servicosMaisRealizados.length === 0 ? (
            <div className="flex items-center justify-center h-[220px]">
              <p className="text-sm text-muted-foreground">Nenhum serviço finalizado este mês</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={servicosMaisRealizados}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="total"
                  nameKey="nome"
                  paddingAngle={3}
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: 'hsl(0,0%,40%)' }}
                >
                  {servicosMaisRealizados.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(0,0%,6%)',
                    border: '1px solid hsl(0,0%,14%)',
                    borderRadius: '0.75rem',
                    color: 'hsl(0,0%,96%)',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Próximos agendamentos */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-sm font-semibold text-foreground">Próximos agendamentos</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/agenda')} className="text-xs gap-1">
            Ver todos <ArrowRight size={12} />
          </Button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 rounded-xl bg-card p-4 border border-border">
                <div className="skeleton-pulse h-12 w-14 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton-pulse h-4 w-32 rounded" />
                  <div className="skeleton-pulse h-3 w-48 rounded" />
                </div>
                <div className="skeleton-pulse h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : proximosAgendamentos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum agendamento futuro</p>
        ) : (
          <div className="space-y-3">
            {proximosAgendamentos.map((ag, i) => (
              <motion.div
                key={ag.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between rounded-xl bg-card p-4 border border-border hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[56px]">
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(ag.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="font-heading text-lg font-bold text-primary">{ag.hora?.slice(0, 5)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{ag.clientes?.nome || 'Cliente'}</p>
                    <p className="text-xs text-muted-foreground">{ag.servicos?.nome} • {ag.barbeiros?.nome || 'Barbeiro'}</p>
                    {ag.servicos?.preco && (
                      <p className="text-xs text-primary font-semibold">R$ {ag.servicos.preco.toFixed(2).replace('.', ',')}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ag.status} />
                  {ag.clientes?.telefone && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleWhatsApp(ag)}
                      className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-7 w-7 p-0"
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle size={13} />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Alerts */}
      {!loading && metrics.barbeirosAtivos === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-4 border-l-4 border-l-orange-500 flex items-center gap-3"
        >
          <AlertTriangle size={20} className="text-orange-400 flex-shrink-0" />
          <p className="text-sm text-foreground">
            Nenhum barbeiro ativo cadastrado.{' '}
            <button
              onClick={() => navigate('/admin/barbeiros')}
              className="text-primary underline underline-offset-2"
            >
              Adicione barbeiros
            </button>{' '}
            para habilitar agendamentos.
          </p>
        </motion.div>
      )}
    </PageContainer>
  );
};

export default AdminDashboard;
