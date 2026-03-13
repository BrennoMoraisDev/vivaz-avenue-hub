import PageContainer from '@/components/layout/PageContainer';
import { Users } from 'lucide-react';

const AdminBarbeiros = () => (
  <PageContainer title="Barbeiros" subtitle="Gerencie a equipe de barbeiros">
    <div className="glass rounded-2xl p-8 text-center">
      <Users size={48} className="mx-auto mb-4 text-primary/40" />
      <h3 className="font-heading text-lg font-semibold text-foreground">Nenhum barbeiro cadastrado</h3>
      <p className="mt-2 text-sm text-muted-foreground">Adicione barbeiros para começar.</p>
    </div>
  </PageContainer>
);

export default AdminBarbeiros;
