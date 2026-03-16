import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Loader2 } from 'lucide-react';

const AdminConfiguracoes = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    nome: 'Vivaz Barbearia Avenue',
    horarioAbertura: '08:00',
    horarioFechamento: '20:00',
    intervaloMinutos: '30',
    email: '',
    telefone: '',
    endereco: '',
    logo: '',
  });

  const handleSave = () => {
    setSaving(true);
    // TODO: Save to configuracoes table when created
    setTimeout(() => {
      setSaving(false);
      toast({ title: 'Configurações salvas' });
    }, 500);
  };

  const update = (field: string, value: string) => setConfig({ ...config, [field]: value });

  return (
    <PageContainer title="Configurações" subtitle="Ajustes gerais do sistema">
      <div className="glass rounded-2xl p-6 max-w-2xl space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Settings size={20} className="text-primary" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Dados da Barbearia</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Nome da barbearia</Label><Input value={config.nome} onChange={(e) => update('nome', e.target.value)} /></div>
          <div><Label>Telefone</Label><Input value={config.telefone} onChange={(e) => update('telefone', e.target.value)} /></div>
          <div><Label>E-mail de contato</Label><Input value={config.email} onChange={(e) => update('email', e.target.value)} /></div>
          <div><Label>Endereço</Label><Input value={config.endereco} onChange={(e) => update('endereco', e.target.value)} /></div>
          <div><Label>Horário de abertura</Label><Input type="time" value={config.horarioAbertura} onChange={(e) => update('horarioAbertura', e.target.value)} /></div>
          <div><Label>Horário de fechamento</Label><Input type="time" value={config.horarioFechamento} onChange={(e) => update('horarioFechamento', e.target.value)} /></div>
          <div><Label>Intervalo entre agendamentos (min)</Label><Input type="number" value={config.intervaloMinutos} onChange={(e) => update('intervaloMinutos', e.target.value)} /></div>
          <div><Label>Logo (URL)</Label><Input value={config.logo} onChange={(e) => update('logo', e.target.value)} placeholder="https://..." /></div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
          Salvar configurações
        </Button>
      </div>
    </PageContainer>
  );
};

export default AdminConfiguracoes;
