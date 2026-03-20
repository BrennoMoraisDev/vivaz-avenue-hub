import PageContainer from '@/components/layout/PageContainer';
import { ClipboardList } from 'lucide-react';

const BarbeiroAtendimentos = () => (
  <PageContainer title="Atendimentos" subtitle="Registre e gerencie seus atendimentos">
    <div className="glass rounded-2xl p-8 text-center">
      <ClipboardList size={48} className="mx-auto mb-4 text-primary/40" />
      <h3 className="font-heading text-lg font-semibold text-foreground">Sem atendimentos registrados</h3>
      <p className="mt-2 text-sm text-muted-foreground">Use este módulo para registrar atendimentos manuais.</p>
    </div>
  </PageContainer>
);

export default BarbeiroAtendimentos;
