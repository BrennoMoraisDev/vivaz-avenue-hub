import { useState, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useBIAdmin } from '@/hooks/useBIAdmin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import {
  Flame, DollarSign, Users, TrendingUp, Scissors,
  Download, Loader2, Award, BarChart3
} from 'lucide-react';

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;
const fmtPct = (v: number) => `${v.toFixed(1)}%`;

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HORAS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];

function getHeatColor(value: number, max: number): string {
  if (max === 0 || value === 0) return 'hsl(0,0%,10%)';
  const intensity = value / max;
  if (intensity < 0.25) return `hsl(43,65%,52%,0.15)`;
  if (intensity < 0.5) return `hsl(43,65%,52%,0.35)`;
  if (intensity < 0.75) return `hsl(43,65%,52%,0.6)`;
  return `hsl(43,65%,52%,0.9)`;
}

const AdminBI = () => {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
  const [dataInicio, setDataInicio] = useState(inicioMes);
  const [dataFim, setDataFim] = useState(hoje.toISOString().split('T')[0]);
  const [periodoAplicado, setPeriodoAplicado] = useState({ inicio: inicioMes, fim: hoje.toISOString().split('T')[0] });

  const { heatmap, comissoes, ticketClientes, metrics, loading } = useBIAdmin(periodoAplicado);

  const maxHeatmap = useMemo(() => Math.max(...heatmap.map(h => h.total), 1), [heatmap]);

  const exportarCSV = () => {
    const rows = [
      ['Barbeiro', 'Atendimentos', 'Faturamento Bruto', 'Comissão (%)', 'Comissão (R$)', 'Ticket Médio'],
      ...comissoes.map(c => [
        c.nome || '',
        c.total_atendimentos,
        fmt(c.faturamento_bruto),
        fmtPct(c.comissao_percentual),
        fmt(c.comissao_valor),
        fmt(c.ticket_medio),
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comissoes_${periodoAplicado.inicio}_${periodoAplicado.fim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer title="Inteligência de Negócio" subtitle="Análise avançada de desempenho">
      {/* Filtros de período */}
      <div className="glass rounded-2xl p-4 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Data início</Label>
          <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-auto" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Data fim</Label>
          <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-auto" />
        </div>
        <Button
          onClick={() => setPeriodoAplicado({ inicio: dataInicio, fim: dataFim })}
          disabled={loading}
          className="gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
          Analisar
        </Button>
      </div>

      {/* KPIs de BI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { icon: DollarSign, label: 'Faturamento total', value: fmt(metrics.faturamentoTotal), color: 'text-emerald-400' },
          { icon: Scissors, label: 'Atendimentos', value: String(metrics.totalAtendimentos), color: 'text-blue-400' },
          { icon: TrendingUp, label: 'Ticket médio', value: fmt(metrics.ticketMedioGeral), color: 'text-primary' },
          { icon: Users, label: 'Clientes únicos', value: String(metrics.clientesAtivos), color: 'text-purple-400' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <kpi.icon size={20} className={kpi.color} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
                <p className="font-heading text-xl font-bold text-foreground">{kpi.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="heatmap" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="heatmap" className="gap-2">
            <Flame size={14} /> Mapa de Calor
          </TabsTrigger>
          <TabsTrigger value="comissoes" className="gap-2">
            <Award size={14} /> Comissões
          </TabsTrigger>
          <TabsTrigger value="clientes" className="gap-2">
            <Users size={14} /> Clientes
          </TabsTrigger>
        </TabsList>

        {/* ─── Mapa de Calor ─────────────────────────────────────────────── */}
        <TabsContent value="heatmap">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading text-base font-semibold text-foreground">Mapa de Calor de Horários</h3>
                <p className="text-xs text-muted-foreground mt-1">Horários com maior demanda — crie promoções nos horários ociosos</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded" style={{ background: 'hsl(43,65%,52%,0.15)' }} />
                  <span>Baixo</span>
                </div>
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded" style={{ background: 'hsl(43,65%,52%,0.6)' }} />
                  <span>Médio</span>
                </div>
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded" style={{ background: 'hsl(43,65%,52%,0.9)' }} />
                  <span>Alto</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                  {/* Header com dias */}
                  <div className="flex mb-1">
                    <div className="w-10 flex-shrink-0" />
                    {DIAS.map(dia => (
                      <div key={dia} className="flex-1 text-center text-[10px] font-medium text-muted-foreground py-1">
                        {dia}
                      </div>
                    ))}
                  </div>

                  {/* Grid */}
                  {HORAS.map(hora => (
                    <div key={hora} className="flex items-center mb-1">
                      <div className="w-10 flex-shrink-0 text-[10px] text-muted-foreground text-right pr-2">
                        {hora}h
                      </div>
                      {DIAS.map((dia, dIdx) => {
                        const cell = heatmap.find(h => h.hora === hora && h.dia === dia);
                        const total = cell?.total || 0;
                        return (
                          <motion.div
                            key={dia}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (HORAS.indexOf(hora) * 7 + dIdx) * 0.005 }}
                            className="flex-1 mx-0.5 h-8 rounded-md flex items-center justify-center text-[10px] font-medium cursor-default transition-transform hover:scale-110"
                            style={{
                              background: getHeatColor(total, maxHeatmap),
                              color: total > 0 ? 'hsl(43,65%,80%)' : 'transparent',
                            }}
                            title={`${dia} ${hora}h: ${total} agendamento${total !== 1 ? 's' : ''}`}
                          >
                            {total > 0 ? total : ''}
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Comissões ─────────────────────────────────────────────────── */}
        <TabsContent value="comissoes">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading text-base font-semibold text-foreground">Relatório de Comissões</h3>
                <p className="text-xs text-muted-foreground mt-1">Quanto pagar para cada barbeiro no período selecionado</p>
              </div>
              <Button variant="outline" size="sm" onClick={exportarCSV} className="gap-2">
                <Download size={14} />
                Exportar CSV
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : comissoes.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Nenhum atendimento finalizado no período</p>
            ) : (
              <>
                {/* Gráfico */}
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={comissoes} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <XAxis dataKey="nome" tick={{ fill: 'hsl(0,0%,63%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'hsl(0,0%,63%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(0,0%,6%)', border: '1px solid hsl(0,0%,14%)', borderRadius: '0.75rem', color: 'hsl(0,0%,96%)' }}
                        formatter={(v: number) => [fmt(v)]}
                      />
                      <Legend />
                      <Bar dataKey="faturamento_bruto" name="Faturamento" fill="hsl(43,65%,52%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="comissao_valor" name="Comissão" fill="hsl(43,45%,35%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tabela */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground">
                        <th className="py-3 px-4">Barbeiro</th>
                        <th className="py-3 px-4 text-center">Atendimentos</th>
                        <th className="py-3 px-4 text-right">Fat. Bruto</th>
                        <th className="py-3 px-4 text-center">Comissão</th>
                        <th className="py-3 px-4 text-right font-bold text-primary">A Pagar</th>
                        <th className="py-3 px-4 text-right">Ticket Médio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comissoes.map((c, i) => (
                        <motion.tr
                          key={c.barbeiro_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-border/50 hover:bg-surface-hover transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {c.foto ? (
                                <img src={c.foto} alt={c.nome || ''} className="h-7 w-7 rounded-full object-cover" />
                              ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                  {(c.nome || '?')[0].toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium text-foreground">{c.nome || '—'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-foreground">{c.total_atendimentos}</td>
                          <td className="py-3 px-4 text-right text-foreground">{fmt(c.faturamento_bruto)}</td>
                          <td className="py-3 px-4 text-center text-muted-foreground">{fmtPct(c.comissao_percentual)}</td>
                          <td className="py-3 px-4 text-right font-bold text-primary">{fmt(c.comissao_valor)}</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">{fmt(c.ticket_medio)}</td>
                        </motion.tr>
                      ))}
                      {/* Total */}
                      <tr className="border-t-2 border-primary/20 bg-primary/5">
                        <td className="py-3 px-4 font-bold text-foreground">TOTAL</td>
                        <td className="py-3 px-4 text-center font-bold text-foreground">
                          {comissoes.reduce((s, c) => s + c.total_atendimentos, 0)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-foreground">
                          {fmt(comissoes.reduce((s, c) => s + c.faturamento_bruto, 0))}
                        </td>
                        <td />
                        <td className="py-3 px-4 text-right font-bold text-primary text-base">
                          {fmt(comissoes.reduce((s, c) => s + c.comissao_valor, 0))}
                        </td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* ─── Clientes / Ticket Médio ───────────────────────────────────── */}
        <TabsContent value="clientes">
          <div className="glass rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="font-heading text-base font-semibold text-foreground">Ticket Médio por Cliente</h3>
              <p className="text-xs text-muted-foreground mt-1">Clientes mais valiosos e seus serviços favoritos</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : ticketClientes.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Nenhum dado no período</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Telefone</th>
                      <th className="py-3 px-4 text-center">Visitas</th>
                      <th className="py-3 px-4 text-right">Gasto Total</th>
                      <th className="py-3 px-4 text-right">Ticket Médio</th>
                      <th className="py-3 px-4">Serviço Favorito</th>
                      <th className="py-3 px-4">Última Visita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketClientes.slice(0, 50).map((c, i) => {
                      const diasSemVisita = c.ultimo_agendamento
                        ? Math.floor((Date.now() - new Date(c.ultimo_agendamento + 'T12:00:00').getTime()) / 86400000)
                        : null;
                      return (
                        <motion.tr
                          key={c.cliente_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-border/50 hover:bg-surface-hover transition-colors"
                        >
                          <td className="py-3 px-4 text-muted-foreground text-xs">{i + 1}</td>
                          <td className="py-3 px-4 font-medium text-foreground">{c.nome || '—'}</td>
                          <td className="py-3 px-4 text-muted-foreground">{c.telefone || '—'}</td>
                          <td className="py-3 px-4 text-center text-foreground">{c.total_atendimentos}</td>
                          <td className="py-3 px-4 text-right font-medium text-foreground">{fmt(c.gasto_total)}</td>
                          <td className="py-3 px-4 text-right text-primary font-semibold">{fmt(c.ticket_medio)}</td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">{c.servico_favorito || '—'}</td>
                          <td className="py-3 px-4">
                            {c.ultimo_agendamento ? (
                              <span className={`text-xs ${diasSemVisita && diasSemVisita > 20 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                                {new Date(c.ultimo_agendamento + 'T12:00:00').toLocaleDateString('pt-BR')}
                                {diasSemVisita && diasSemVisita > 20 && (
                                  <span className="ml-1 text-orange-400">({diasSemVisita}d)</span>
                                )}
                              </span>
                            ) : '—'}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default AdminBI;
