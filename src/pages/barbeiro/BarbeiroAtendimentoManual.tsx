import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import ClienteSearchInput from '@/components/barbeiro/ClienteSearchInput';
import { useBarbeiroProfile, criarAtendimentoManual, criarCliente, ClienteBusca } from '@/hooks/useBarbeiro';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';

interface Servico {
  id: string;
  nome: string | null;
  preco: number | null;
}

const BarbeiroAtendimentoManual = () => {
  const navigate = useNavigate();
  const { barbeiro, loading: loadB } = useBarbeiroProfile();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteBusca | null>(null);
  const [novoCliente, setNovoCliente] = useState(false);
  const [nomeNovo, setNomeNovo] = useState('');
  const [telNovo, setTelNovo] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [hora, setHora] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('servicos').select('id, nome, preco').eq('ativo', true).then(({ data }) => {
      setServicos((data as Servico[]) || []);
    });
  }, []);

  const handleSave = async () => {
    if (!barbeiro) return;
    setSaving(true);

    let clienteId = clienteSelecionado?.id;

    if (novoCliente) {
      if (!nomeNovo || !telNovo) {
        toast({ title: 'Preencha nome e telefone do novo cliente', variant: 'destructive' });
        setSaving(false);
        return;
      }
      const { data, error } = await criarCliente(nomeNovo, telNovo) as any;
      if (error || !data) {
        toast({ title: 'Erro ao criar cliente', description: error?.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
      clienteId = data.id;
    }

    if (!clienteId || !servicoId) {
      toast({ title: 'Selecione cliente e serviço', variant: 'destructive' });
      setSaving(false);
      return;
    }

    const { error } = await criarAtendimentoManual({
      clienteId,
      barbeiroId: barbeiro.id,
      servicoId,
      data: new Date().toISOString().split('T')[0],
      hora,
      observacao: obs,
    });

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Atendimento registrado com sucesso!' });
      navigate('/barbeiro/dashboard');
    }
    setSaving(false);
  };

  if (loadB) return (
    <PageContainer title="Atendimento Manual">
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </PageContainer>
  );

  return (
    <PageContainer title="Atendimento Manual" subtitle="Registre um atendimento sem agendamento prévio">
      <div className="glass rounded-2xl p-6 max-w-xl space-y-5">
        {/* Cliente */}
        <div className="space-y-2">
          <Label>Cliente</Label>
          {!novoCliente ? (
            <>
              <ClienteSearchInput
                onSelect={(c) => { setClienteSelecionado(c); setNovoCliente(false); }}
                onNewClient={() => setNovoCliente(true)}
              />
              {clienteSelecionado && (
                <p className="text-sm text-primary">Selecionado: {clienteSelecionado.nome}</p>
              )}
            </>
          ) : (
            <div className="space-y-3 glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <UserPlus size={16} /> <span className="text-sm font-medium">Novo cliente</span>
              </div>
              <Input placeholder="Nome completo" value={nomeNovo} onChange={e => setNomeNovo(e.target.value)} />
              <Input placeholder="Telefone" value={telNovo} onChange={e => setTelNovo(e.target.value)} />
              <Button variant="ghost" size="sm" onClick={() => setNovoCliente(false)}>Buscar existente</Button>
            </div>
          )}
        </div>

        {/* Serviço */}
        <div className="space-y-2">
          <Label>Serviço</Label>
          <Select value={servicoId} onValueChange={setServicoId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o serviço" />
            </SelectTrigger>
            <SelectContent>
              {servicos.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome} — R$ {Number(s.preco || 0).toFixed(2).replace('.', ',')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Horário */}
        <div className="space-y-2">
          <Label>Horário</Label>
          <Input type="time" value={hora} onChange={e => setHora(e.target.value)} className="w-auto" />
        </div>

        {/* Observação */}
        <div className="space-y-2">
          <Label>Observação (opcional)</Label>
          <Textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Alguma observação..." />
        </div>

        <Button variant="gold" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Registrar atendimento'}
        </Button>
      </div>
    </PageContainer>
  );
};

export default BarbeiroAtendimentoManual;
