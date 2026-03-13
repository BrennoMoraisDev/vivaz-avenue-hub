import PageContainer from '@/components/layout/PageContainer';
import { Clock } from 'lucide-react';

const ClienteHistorico = () => (
  <PageContainer title="Histórico" subtitle="Seus atendimentos anteriores">
    <div className="glass rounded-2xl p-8 text-center">
      <Clock size={48} className="mx-auto mb-4 text-primary/40" />
      <h3 className="font-heading text-lg font-semibold text-foreground">Sem histórico</h3>
      <p className="mt-2 text-sm text-muted-foreground">Seus atendimentos concluídos aparecerão aqui.</p>
    </div>
  </PageContainer>
);

export default ClienteHistorico;
