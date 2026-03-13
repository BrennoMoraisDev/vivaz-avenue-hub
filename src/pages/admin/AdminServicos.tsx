import PageContainer from '@/components/layout/PageContainer';
import { Scissors } from 'lucide-react';

const AdminServicos = () => (
  <PageContainer title="Serviços" subtitle="Gerencie os serviços oferecidos">
    <div className="glass rounded-2xl p-8 text-center">
      <Scissors size={48} className="mx-auto mb-4 text-primary/40" />
      <h3 className="font-heading text-lg font-semibold text-foreground">Nenhum serviço cadastrado</h3>
      <p className="mt-2 text-sm text-muted-foreground">Adicione serviços e preços.</p>
    </div>
  </PageContainer>
);

export default AdminServicos;
