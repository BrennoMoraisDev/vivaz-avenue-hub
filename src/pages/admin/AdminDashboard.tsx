import PageContainer from '@/components/layout/PageContainer';
import { useAdminMetrics } from '@/hooks/useAdmin';
import StatusBadge from '@/components/barbeiro/StatusBadge';
import { CalendarDays, DollarSign, Users, Scissors, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['hsl(43,65%,52%)', 'hsl(43,65%,40%)', 'hsl(43,45%,55%)', 'hsl(43,35%,45%)', 'hsl(0,0%,50%)'];

const AdminDashboard = () => {
  const { metrics, agendamentosPorDia, servicosMaisRealizados, proximosAgendamentos, loading } = useAdminMetrics();

  if (loading) {
    return (
      <PageContainer title="Dashboard" subtitle="Visão geral da barbearia">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  const kpis = [
    { icon: DollarSign, label: 'Faturamento hoje', value: `R$ ${metrics.faturamentoHoje.toFixed(2)}` },
    { icon: TrendingUp, label: 'Faturamento do mês', value: `R$ ${metrics.faturamentoMes.toFixed(2)}` },
    { icon: CalendarDays, label: 'Agendamentos hoje', value: String(metrics.agendamentosHoje) },
    { icon: Users, label: 'Clientes cadastrados', value: String(metrics.clientesCadastrados) },
    { icon: Scissors, label: 'Barbeiros ativos', value: String(metrics.barbeirosAtivos) },
  ];

  return (
    <PageContainer title="Dashboard" subtitle="Visão geral da Vivaz Barbearia Avenue">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <kpi.icon size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
                <p className="font-heading text-xl font-bold text-foreground">{kpi.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Agendamentos por dia (7 dias)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={agendamentosPorDia}>
              <XAxis dataKey="dia" tick={{ fill: 'hsl(0,0%,63%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(0,0%,63%)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(0,0%,6%)', border: '1px solid hsl(0,0%,14%)', borderRadius: '0.75rem', color: 'hsl(0,0%,96%)' }}
              />
              <Bar dataKey="total" fill="hsl(43,65%,52%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Serviços mais realizados (mês)</h3>
          {servicosMaisRealizados.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Nenhum serviço finalizado este mês</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={servicosMaisRealizados}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="total"
                  nameKey="nome"
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {servicosMaisRealizados.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(0,0%,6%)', border: '1px solid hsl(0,0%,14%)', borderRadius: '0.75rem', color: 'hsl(0,0%,96%)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Próximos agendamentos */}
      <div className="glass rounded-2xl p-6 mb-8">
        <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Próximos agendamentos</h3>
        {proximosAgendamentos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum agendamento futuro</p>
        ) : (
          <div className="space-y-3">
            {proximosAgendamentos.map((ag) => (
              <div key={ag.id} className="flex items-center justify-between rounded-xl bg-card p-4 border border-border">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{ag.data}</p>
                    <p className="font-heading text-lg font-bold text-primary">{ag.hora?.slice(0, 5)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{ag.clientes?.nome || 'Cliente'}</p>
                    <p className="text-xs text-muted-foreground">{ag.servicos?.nome} • {ag.barbeiros?.nome || 'Barbeiro'}</p>
                  </div>
                </div>
                <StatusBadge status={ag.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alerts */}
      {metrics.barbeirosAtivos === 0 && (
        <div className="glass rounded-2xl p-4 border-l-4 border-l-orange-500 flex items-center gap-3">
          <AlertTriangle size={20} className="text-orange-400" />
          <p className="text-sm text-foreground">Nenhum barbeiro ativo cadastrado. Adicione barbeiros para habilitar agendamentos.</p>
        </div>
      )}
    </PageContainer>
  );
};

export default AdminDashboard;
