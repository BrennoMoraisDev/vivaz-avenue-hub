import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useFidelidadeAdmin } from '@/hooks/useFidelidade';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Star, Gift, Search, Plus, Loader2, Trophy } from 'lucide-react';

const AdminFidelidade = () => {
  const { ranking, loading, refetch } = useFidelidadeAdmin();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [resgateOpen, setResgateOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<{ id: string; nome: string | null } | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = ranking.filter(c =>
    !search || (c.nome || '').toLowerCase().includes(search.toLowerCase()) || (c.telefone || '').includes(search)
  );

  const handleResgatar = async () => {
    if (!clienteSelecionado) return;
    setSaving(true);
    const { error } = await supabase.from('fidelidade').insert({
      cliente_id: clienteSelecionado.id,
      pontos: 10,
      tipo: 'resgatado',
      descricao: 'Corte grátis resgatado pelo admin',
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao resgatar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Resgate registrado!', description: `Corte grátis para ${clienteSelecionado.nome}` });
      setResgateOpen(false);
      refetch();
    }
  };

  const handleAdicionarPonto = async (clienteId: string, nome: string | null) => {
    const { error } = await supabase.from('fidelidade').insert({
      cliente_id: clienteId,
      pontos: 1,
      tipo: 'ganho',
      descricao: 'Ponto adicionado manualmente pelo admin',
    } as any);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Ponto adicionado', description: `+1 ponto para ${nome}` });
      refetch();
    }
  };

  return (
    <PageContainer title="Fidelidade" subtitle="Programa de fidelidade da barbearia">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="glass rounded-2xl p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Star size={20} className="text-primary fill-primary" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Clientes no programa</p>
            <p className="font-heading text-xl font-bold text-foreground">{ranking.length}</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <Gift size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Prontos para resgatar</p>
            <p className="font-heading text-xl font-bold text-foreground">
              {ranking.filter(c => c.pontos_disponiveis >= 10).length}
            </p>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
            <Trophy size={20} className="text-purple-400" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Total de cortes registrados</p>
            <p className="font-heading text-xl font-bold text-foreground">
              {ranking.reduce((s, c) => s + c.total_cortes, 0)}
            </p>
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

      {/* Tabela */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Star size={48} className="mx-auto mb-4 text-primary/30" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Nenhum cliente no programa</h3>
          <p className="text-sm text-muted-foreground mt-2">Os pontos são adicionados automaticamente quando um atendimento é finalizado.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Telefone</th>
                <th className="py-3 px-4 text-center">Cortes</th>
                <th className="py-3 px-4 text-center">Pontos</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const podeResgatar = c.pontos_disponiveis >= 10;
                const progresso = (c.pontos_disponiveis % 10) / 10 * 100;
                return (
                  <motion.tr
                    key={c.cliente_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 hover:bg-surface-hover transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-foreground">{c.nome || '—'}</td>
                    <td className="py-3 px-4 text-muted-foreground">{c.telefone || '—'}</td>
                    <td className="py-3 px-4 text-center text-foreground">{c.total_cortes}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-primary">{c.pontos_disponiveis}</span>
                        <div className="h-1 w-16 rounded-full bg-primary/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${progresso}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {podeResgatar ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                          <Gift size={10} /> Disponível
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {10 - (c.pontos_disponiveis % 10)} para próximo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAdicionarPonto(c.cliente_id, c.nome)}
                          title="Adicionar ponto manualmente"
                        >
                          <Plus size={14} />
                        </Button>
                        {podeResgatar && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                            onClick={() => {
                              setClienteSelecionado({ id: c.cliente_id, nome: c.nome });
                              setResgateOpen(true);
                            }}
                          >
                            <Gift size={14} className="mr-1" />
                            Resgatar
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog de resgate */}
      <Dialog open={resgateOpen} onOpenChange={setResgateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Resgate</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Confirmar resgate de <strong>1 corte grátis</strong> para{' '}
            <strong className="text-foreground">{clienteSelecionado?.nome}</strong>?
            Isso irá descontar 10 pontos do saldo do cliente.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResgateOpen(false)}>Cancelar</Button>
            <Button onClick={handleResgatar} disabled={saving} className="gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Gift size={14} />}
              Confirmar Resgate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default AdminFidelidade;
