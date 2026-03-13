import PageContainer from '@/components/layout/PageContainer';
import { CalendarDays, Users, Scissors, TrendingUp } from 'lucide-react';

const stats = [
  { icon: CalendarDays, label: 'Agendamentos hoje', value: '0' },
  { icon: Users, label: 'Clientes atendidos', value: '0' },
  { icon: Scissors, label: 'Serviços realizados', value: '0' },
  { icon: TrendingUp, label: 'Faturamento', value: 'R$ 0' },
];

const BarbeiroDashboard = () => (
  <PageContainer title="Dashboard" subtitle="Bem-vindo ao painel do barbeiro">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <stat.icon size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="font-heading text-xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-8 glass rounded-2xl p-8 text-center">
      <p className="text-muted-foreground">Seus atendimentos do dia aparecerão aqui.</p>
    </div>
  </PageContainer>
);

export default BarbeiroDashboard;
