import { useState, useEffect, useCallback } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { linkLembreteRetornoWhatsApp, abrirWhatsApp } from '@/lib/whatsapp';
import { MessageCircle, Clock, Search, Loader2, Bell, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClienteSumido {
  id: string;
  nome: string | null;
  telefone: string | null;
  email: string | null;
  ultimoAgendamento: string | null;
  diasSemVisita: number;
  totalCortes: number;
}

const AdminLembretes = () => {
  const [clientes, setClientes] = useState<ClienteSumido[]>([]);
  const [loading, setLoading] = useState(true);
  const [diasMinimos, setDiasMinimos] = useState(20);
  const [search, setSearch] = useState('');
  const [enviados, setEnviados] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchClientesSumidos = useCallback(async () => {
    setLoading(true);
    try {
      // Busca todos os clientes com seus últimos agendamentos
      const { data: perfis } = await supabase
        .from('perfis')
        .select('id, nome, telefone')
        .eq('role', 'cliente');

      if (!perfis) { setLoading(false); return; }

      const hoje = new Date();
      const resultado: ClienteSumido[] = [];

      await Promise.all(
        perfis.map(async (p: any) => {
          const { data: ags } = await supabase
            .from('agendamentos')
            .select('data, status')
            .eq('cliente_id', p.id)
            .in('status', ['finalizado', 'confirmado', 'agendado'])
            .order('data', { ascending: false })
            .limit(1);

          const ultimo = (ags as any)?.[0]?.data || null;
          let diasSemVisita = 999;

          if (ultimo) {
            const d = new Date(ultimo + 'T12:00:00');
            diasSemVisita = Math.floor((hoje.getTime() - d.getTime()) / 86400000);
          }

          // Conta total de cortes finalizados
          const { count } = await supabase
            .from('agendamentos')
            .select('*', { count: 'exact', head: true })
            .eq('cliente_id', p.id)
            .eq('status', 'finalizado');

          if (diasSemVisita >= diasMinimos) {
            resultado.push({
              id: p.id,
              nome: p.nome,
              telefone: p.telefone,
              email: null,
              ultimoAgendamento: ultimo,
              diasSemVisita,
              totalCortes: count || 0,
            });
          }
        })
      );

      resultado.sort((a, b) => b.diasSemVisita - a.diasSemVisita);
      setClientes(resultado);
    } catch (err) {
      console.error('Erro ao buscar clientes sumidos:', err);
    } finally {
      setLoading(false);
    }
  }, [diasMinimos]);

  useEffect(() => { fetchClientesSumidos(); }, [fetchClientesSumidos]);

  const handleEnviarLembrete = (cliente: ClienteSumido) => {
    if (!cliente.telefone) {
      toast({ title: 'Cliente sem telefone', variant: 'destructive' });
      return;
    }
    const link = linkLembreteRetornoWhatsApp(
      cliente.nome || 'Cliente',
      cliente.telefone,
      cliente.diasSemVisita,
      'Vivaz Barbearia Avenue'
    );
    abrirWhatsApp(link);
    setEnviados(prev => new Set([...prev, cliente.id]));
    toast({ title: 'WhatsApp aberto!', description: `Lembrete para ${cliente.nome}` });
  };

  const filtered = clientes.filter(c =>
    !search || (c.nome || '').toLowerCase().includes(search.toLowerCase()) || (c.telefone || '').includes(search)
  );

  return (
    <PageContainer title="Lembretes de Retorno" subtitle="Clientes que não visitam há algum tempo">
      {/* Config */}
      <div className="glass rounded-2xl p-4 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Dias mínimos sem visita</Label>
          <Input
            type="number"
            value={diasMinimos}
            onChange={e => setDiasMinimos(parseInt(e.target.value) || 20)}
            className="w-24"
            min={1}
          />
        </div>
        <Button onClick={fetchClientesSumidos} disabled={loading} className="gap-2">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
          Atualizar lista
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
            <Clock size={18} className="text-orange-400" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Clientes sumidos</p>
            <p className="font-heading text-xl font-bold text-foreground">{clientes.length}</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <CheckCircle size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Lembretes enviados</p>
            <p className="font-heading text-xl font-bold text-foreground">{enviados.size}</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <MessageCircle size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Pendentes</p>
            <p className="font-heading text-xl font-bold text-foreground">{clientes.length - enviados.size}</p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="relative mb-4 max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-emerald-400/40" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Nenhum cliente sumido!</h3>
          <p className="text-sm text-muted-foreground mt-2">Todos os clientes visitaram recentemente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                enviados.has(c.id) ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-400 flex-shrink-0">
                  {(c.nome || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{c.nome || '—'}</p>
                  <p className="text-xs text-muted-foreground">{c.telefone || 'Sem telefone'}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.totalCortes} corte{c.totalCortes !== 1 ? 's' : ''} •{' '}
                    {c.ultimoAgendamento
                      ? `Última visita: ${new Date(c.ultimoAgendamento + 'T12:00:00').toLocaleDateString('pt-BR')}`
                      : 'Nunca visitou'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-center px-3 py-1 rounded-full text-xs font-bold ${
                  c.diasSemVisita > 30 ? 'bg-red-500/15 text-red-400' : 'bg-orange-500/15 text-orange-400'
                }`}>
                  {c.diasSemVisita === 999 ? 'Nunca' : `${c.diasSemVisita}d`}
                </div>
                {enviados.has(c.id) ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle size={14} /> Enviado
                  </span>
                ) : (
                  <Button
                    size="sm"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleEnviarLembrete(c)}
                    disabled={!c.telefone}
                  >
                    <MessageCircle size={14} />
                    WhatsApp
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default AdminLembretes;
