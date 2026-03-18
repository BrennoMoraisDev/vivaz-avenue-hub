import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PageContainer from '@/components/layout/PageContainer';
import AppointmentCard from '@/components/cliente/AppointmentCard';
import { CartaoFidelidade } from '@/components/cliente/CartaoFidelidade';
import { Button } from '@/components/ui/button';
import { SkeletonAppointmentCard } from '@/components/ui/SkeletonCard';
import { CalendarDays, Clock, Scissors, ArrowRight } from 'lucide-react';
import { useAgendamentosCliente } from '@/hooks/useAgendamentos';
import { motion } from 'framer-motion';

const shortcuts = [
  { icon: CalendarDays, label: 'Agendar horário', path: '/cliente/agendar', color: 'text-primary' },
  { icon: Clock, label: 'Meus agendamentos', path: '/cliente/historico', color: 'text-primary' },
  { icon: Scissors, label: 'Serviços', path: '/cliente/servicos', color: 'text-primary' },
];

const ClienteDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { agendamentos, loading } = useAgendamentosCliente();

  const firstName = profile?.nome?.split(' ')[0] || 'Cliente';

  // Próximos agendamentos (agendado ou confirmado)
  const proximos = agendamentos
    .filter(a => ['agendado', 'confirmado'].includes(a.status))
    .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))
    .slice(0, 3);

  return (
    <PageContainer>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-sm text-muted-foreground">Bem-vindo de volta</p>
        <h1 className="font-heading text-2xl font-bold md:text-3xl">
          Olá, <span className="text-gradient-gold">{firstName}</span>
        </h1>
      </motion.div>

      {/* Cartão de Fidelidade */}
      <div className="mb-6">
        <CartaoFidelidade />
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {shortcuts.map((s, i) => (
          <motion.button
            key={s.path}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(s.path)}
            className="glass rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-gold hover:scale-[1.02] touch-feedback"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <s.icon size={20} className={s.color} />
            </div>
            <span className="text-xs font-medium text-foreground text-center">{s.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Próximos agendamentos */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Próximos Agendamentos</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate('/cliente/historico')} className="text-xs gap-1">
          Ver todos <ArrowRight size={14} />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <SkeletonAppointmentCard key={i} />)}
        </div>
      ) : proximos.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {proximos.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <AppointmentCard
                agendamento={a}
                onCancelar={() => navigate('/cliente/historico')}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-8 text-center"
        >
          <CalendarDays size={36} className="mx-auto mb-3 text-primary/30" />
          <p className="text-sm text-muted-foreground">Nenhum agendamento próximo</p>
          <Button variant="gold" size="sm" className="mt-4" onClick={() => navigate('/cliente/agendar')}>
            Agendar agora
          </Button>
        </motion.div>
      )}
    </PageContainer>
  );
};

export default ClienteDashboard;
