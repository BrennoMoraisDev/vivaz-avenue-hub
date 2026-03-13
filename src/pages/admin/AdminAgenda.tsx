import PageContainer from '@/components/layout/PageContainer';
import { CalendarDays, Users, Scissors, Tag, Settings, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sections = [
  { icon: CalendarDays, label: 'Agenda', desc: 'Visão geral dos agendamentos', path: '/admin/agenda' },
  { icon: Users, label: 'Barbeiros', desc: 'Gerenciar equipe', path: '/admin/barbeiros' },
  { icon: Scissors, label: 'Serviços', desc: 'Gerenciar serviços e preços', path: '/admin/servicos' },
  { icon: Tag, label: 'Categorias', desc: 'Organizar categorias', path: '/admin/categorias' },
  { icon: Users, label: 'Clientes', desc: 'Base de clientes', path: '/admin/clientes' },
  { icon: Settings, label: 'Configurações', desc: 'Ajustes do sistema', path: '/admin/configuracoes' },
];

const AdminAgenda = () => {
  const navigate = useNavigate();

  return (
    <PageContainer title="Painel Administrativo" subtitle="Gerencie a Vivaz Barbearia Avenue">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {[
          { icon: CalendarDays, label: 'Agendamentos hoje', value: '0' },
          { icon: TrendingUp, label: 'Faturamento do mês', value: 'R$ 0' },
          { icon: Users, label: 'Clientes cadastrados', value: '0' },
        ].map((stat) => (
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

      <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Gerenciamento</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((item) => (
          <button
            key={item.path + item.label}
            onClick={() => navigate(item.path)}
            className="glass rounded-2xl p-6 text-left transition-all duration-300 hover:border-primary/30 hover:shadow-gold group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <item.icon size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </PageContainer>
  );
};

export default AdminAgenda;
