import PageContainer from '@/components/layout/PageContainer';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Phone, Shield } from 'lucide-react';

const ClientePerfil = () => {
  const { profile, user } = useAuth();

  return (
    <PageContainer title="Meu Perfil" subtitle="Gerencie suas informações pessoais">
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {profile?.nome ? profile.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">{profile?.nome || 'Usuário'}</h2>
            <p className="text-sm capitalize text-muted-foreground">{profile?.role || 'cliente'}</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { icon: Mail, label: 'Email', value: user?.email },
            { icon: Phone, label: 'Telefone', value: profile?.telefone || 'Não informado' },
            { icon: Shield, label: 'Tipo de conta', value: profile?.role || 'cliente' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
              <item.icon size={16} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm capitalize text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

export default ClientePerfil;
