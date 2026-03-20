import PageContainer from '@/components/layout/PageContainer';
import { CalendarDays } from 'lucide-react';

const ClienteAgenda = () => (
  <PageContainer title="Meus Agendamentos" subtitle="Gerencie seus horários na Vivaz">
    <div className="glass rounded-2xl p-8 text-center">
      <CalendarDays size={48} className="mx-auto mb-4 text-primary/40" />
      <h3 className="font-heading text-lg font-semibold text-foreground">Nenhum agendamento</h3>
      <p className="mt-2 text-sm text-muted-foreground">Você ainda não tem agendamentos. Que tal marcar um horário?</p>
    </div>
  </PageContainer>
);

export default ClienteAgenda;
