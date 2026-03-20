import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useBarbeiroProfile } from '@/hooks/useBarbeiro';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, User } from 'lucide-react';

const BarbeiroPerfil = () => {
  const { user } = useAuth();
  const { barbeiro, loading } = useBarbeiroProfile();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (barbeiro) {
      setNome(barbeiro.nome || '');
      setTelefone(barbeiro.telefone || '');
      setEspecialidade(barbeiro.especialidade || '');
    }
  }, [barbeiro]);

  const handleSave = async () => {
    if (!barbeiro) return;
    setSaving(true);
    const { error } = await (supabase.from('barbeiros') as any)
      .update({ nome, telefone, especialidade })
      .eq('id', barbeiro.id);

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Perfil atualizado!' });
    }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    toast({ title: 'Email enviado', description: 'Verifique sua caixa de entrada.' });
  };

  if (loading) return (
    <PageContainer title="Perfil">
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </PageContainer>
  );

  return (
    <PageContainer title="Meu Perfil" subtitle="Edite seus dados pessoais">
      <div className="glass rounded-2xl p-6 max-w-xl space-y-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <User size={32} className="text-primary" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-foreground">{nome || 'Barbeiro'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Nome</Label>
          <Input value={nome} onChange={e => setNome(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input value={telefone} onChange={e => setTelefone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Especialidade</Label>
          <Input value={especialidade} onChange={e => setEspecialidade(e.target.value)} placeholder="Ex: Degradê, Barboterapia" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="gold" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
          </Button>
          <Button variant="gold-outline" onClick={handleResetPassword}>Alterar senha</Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default BarbeiroPerfil;
