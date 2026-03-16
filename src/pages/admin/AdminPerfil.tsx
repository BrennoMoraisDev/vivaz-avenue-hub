import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Save, Loader2, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const AdminPerfil = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [nome, setNome] = useState(profile?.nome || '');
  const [telefone, setTelefone] = useState(profile?.telefone || '');
  const [saving, setSaving] = useState(false);
  const [senhaOpen, setSenhaOpen] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await (supabase.from('perfis') as any).update({ nome, telefone }).eq('id', user.id);
    setSaving(false);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Perfil atualizado' }); refreshProfile(); }
  };

  const handleChangePass = async () => {
    if (newPass.length < 6) { toast({ title: 'Senha deve ter ao menos 6 caracteres', variant: 'destructive' }); return; }
    setChangingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setChangingPass(false);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Senha alterada' }); setSenhaOpen(false); setNewPass(''); }
  };

  return (
    <PageContainer title="Meu Perfil" subtitle="Gerencie seus dados pessoais">
      <div className="glass rounded-2xl p-6 max-w-lg space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xl">
            {(profile?.nome || '?')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">{profile?.nome || 'Admin'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div><Label>Nome</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
          <div><Label>Telefone</Label><Input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
            Salvar
          </Button>
          <Button variant="outline" onClick={() => setSenhaOpen(true)} className="gap-2">
            <Lock size={16} /> Alterar senha
          </Button>
        </div>
      </div>

      <Dialog open={senhaOpen} onOpenChange={setSenhaOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Alterar Senha</DialogTitle></DialogHeader>
          <div className="py-2">
            <Label>Nova senha</Label>
            <Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSenhaOpen(false)}>Cancelar</Button>
            <Button onClick={handleChangePass} disabled={changingPass}>
              {changingPass && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Alterar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default AdminPerfil;
