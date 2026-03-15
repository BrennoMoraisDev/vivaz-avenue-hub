import { useState, useEffect, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import GanhosCard from '@/components/barbeiro/GanhosCard';
import { useBarbeiroProfile, useGanhos } from '@/hooks/useBarbeiro';
import { supabase } from '@/lib/supabase';
import { DollarSign, TrendingUp, PieChart as PieIcon, BarChart3, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(43, 65%, 52%)', 'hsl(36, 75%, 43%)', 'hsl(43, 65%, 65%)', '#6366f1', '#22c55e', '#f59e0b'];
const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const BarbeiroGanhos = () => {
  const { barbeiro, loading: loadB } = useBarbeiroProfile();
  const { ganhos } = useGanhos(barbeiro?.id, barbeiro?.comissao || 50);
  const [weekData, setWeekData] = useState<{ dia: string; valor: number }[]>([]);
  const [serviceData, setServiceData] = useState<{ nome: string; valor: number }[]>([]);

  useEffect(() => {
    if (!barbeiro) return;
    const rate = (barbeiro.comissao || 50) / 100;
    const hoje = new Date();

    // Last 7 days
    const dias: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i);
      dias.push(d.toISOString().split('T')[0]);
    }

    supabase
      .from('agendamentos')
      .select('data, servicos(preco, nome)')
      .eq('barbeiro_id', barbeiro.id)
      .eq('status', 'finalizado')
      .gte('data', dias[0])
      .lte('data', dias[6])
      .then(({ data: rows }) => {
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const dayMap: Record<string, number> = {};
        const svcMap: Record<string, number> = {};

        dias.forEach(d => {
          const dow = dayNames[new Date(d + 'T12:00:00').getDay()];
          dayMap[dow] = 0;
        });

        (rows || []).forEach((r: any) => {
          const preco = (r.servicos?.preco || 0) * rate;
          const dow = dayNames[new Date(r.data + 'T12:00:00').getDay()];
          dayMap[dow] = (dayMap[dow] || 0) + preco;
          const sn = r.servicos?.nome || 'Outro';
          svcMap[sn] = (svcMap[sn] || 0) + preco;
        });

        setWeekData(Object.entries(dayMap).map(([dia, valor]) => ({ dia, valor })));
        setServiceData(Object.entries(svcMap).map(([nome, valor]) => ({ nome, valor })));
      });
  }, [barbeiro]);

  if (loadB) return (
    <PageContainer title="Ganhos">
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </PageContainer>
  );

  return (
    <PageContainer title="Ganhos" subtitle="Acompanhe sua performance financeira">
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <GanhosCard icon={DollarSign} label="Hoje" value={fmt(ganhos.hoje)} />
        <GanhosCard icon={TrendingUp} label="Semana" value={fmt(ganhos.semana)} />
        <GanhosCard icon={BarChart3} label="Mês" value={fmt(ganhos.mes)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">Ganhos por dia (últimos 7 dias)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weekData}>
              <XAxis dataKey="dia" tick={{ fill: 'hsl(0,0%,63%)' }} />
              <YAxis tick={{ fill: 'hsl(0,0%,63%)' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(0,0%,6%)', border: '1px solid hsl(0,0%,14%)', borderRadius: 12 }}
                labelStyle={{ color: 'hsl(0,0%,96%)' }}
                formatter={(v: number) => fmt(v)}
              />
              <Bar dataKey="valor" fill="hsl(43,65%,52%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">Distribuição por serviço</h3>
          {serviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={serviceData} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={90} label={({ name }) => String(name)}>
                  {serviceData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(0,0%,6%)', border: '1px solid hsl(0,0%,14%)', borderRadius: 12 }}
                  formatter={(v: number) => fmt(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Sem dados no período.</p>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default BarbeiroGanhos;
