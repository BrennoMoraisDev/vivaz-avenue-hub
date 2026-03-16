import { useState, useRef } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, Shield, Lock, Save, LogOut, Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ClientePerfil = () => {
  const { profile, user, signOut, resetPassword, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(profile?.nome || '');
  const [telefone, setTelefone] = useState(profile?.telefone || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = profile?.nome
    ? profile.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ nome, telefone })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast({ title: 'Perfil atualizado', description: 'Suas informações foram salvas com sucesso.' });
      setEditing(false);
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    await resetPassword(user.email);
    toast({ title: 'Email enviado', description: 'Verifique seu email para redefinir a senha.' });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    
    try {
      setUploadingAvatar(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      const { error: updateError } = await supabase
        .from('perfis')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      await refreshProfile();
      toast({ title: 'Foto atualizada', description: 'Sua foto de perfil foi alterada com sucesso.' });
    } catch (error: any) {
      toast({ title: 'Erro ao fazer upload', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ avatar_url: null })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast({ title: 'Foto removida', description: 'Sua foto de perfil foi removida.' });
    } catch (error: any) {
      toast({ title: 'Erro ao remover foto', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <PageContainer title="Meu Perfil" subtitle="Gerencie suas informações pessoais">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Avatar & Name */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary font-heading">
                  {initials}
                </div>
              )}
              {!editing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  title="Alterar foto"
                >
                  <Upload size={12} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">{profile?.nome || 'Usuário'}</h2>
              <p className="text-sm capitalize text-muted-foreground">{profile?.role || 'cliente'}</p>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome</label>
                <Input value={nome} onChange={e => setNome(e.target.value)} className="glass border-border/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Telefone</label>
                <Input value={telefone} onChange={e => setTelefone(e.target.value)} className="glass border-border/50" placeholder="(00) 00000-0000" />
              </div>
              <div className="flex gap-2">
                <Button variant="gold" size="sm" className="flex-1" onClick={handleSave}>
                  <Save size={14} /> Salvar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
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
              {profile?.avatar_url && (
                <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive" onClick={handleRemoveAvatar}>
                  <X size={14} /> Remover foto
                </Button>
              )}
              <Button variant="gold-outline" size="sm" className="w-full mt-2" onClick={() => setEditing(true)}>
                Editar perfil
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="glass rounded-2xl p-6 space-y-3">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleResetPassword}>
            <Lock size={16} /> Alterar senha
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => signOut()}>
            <LogOut size={16} /> Sair da conta
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default ClientePerfil;
