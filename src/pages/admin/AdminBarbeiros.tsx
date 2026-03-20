import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useBarbeiros, useHorariosBarbeiro, type Barbeiro, type HorarioBarbeiro } from '@/hooks/useAdmin';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Pencil, Power, Loader2, Users, Clock, CalendarOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { ImageUpload } from '@/components/ui/ImageUpload';

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface BarbeiroForm extends Partial<Barbeiro> {
  email?: string;
  senha?: string;
}

const emptyBarbeiro: BarbeiroForm = {
  nome: '', telefone: '', especialidade: '', comissao: 50, ativo: true, foto: '',
};

const AdminBarbeiros = () => {
  const { barbeiros, loading, criar, atualizar, toggleAtivo, refetch } = useBarbeiros();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [editing, setEditing] = useState<BarbeiroForm>(emptyBarbeiro);
  const [selectedBarbeiro, setSelectedBarbeiro] = useState<Barbeiro | null>(null);
  const [saving, setSaving] = useState(false);
  const [isNewBarbeiro, setIsNewBarbeiro] = useState(false);

  const filtered = barbeiros.filter((b) => {
    const matchSearch = !search || (b.nome || '').toLowerCase().includes(search.toLowerCase());
    const matchAtivo =
      filtroAtivo === 'todos' || (filtroAtivo === 'ativo' ? b.ativo : !b.ativo);
    return matchSearch && matchAtivo;
  });

  const handleSave = async () => {
    if (!editing.nome || !editing.telefone) {
      toast({ title: 'Preencha nome e telefone', variant: 'destructive' });
      return;
    }

    // If creating new barbeiro with email, use the create-barbeiro-user function
    if (!editing.id && editing.email && isNewBarbeiro) {
      setSaving(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(
          'https://okmuhustvzkbwxsfemxn.functions.supabase.co/create-barbeiro-user',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token || ''}`,
            },
            body: JSON.stringify({
              nome: editing.nome,
              email: editing.email,
              telefone: editing.telefone,
              especialidade: editing.especialidade,
              comissao: editing.comissao,
              senha: editing.senha,
            }),
          }
        );

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        toast({
          title: 'Barbeiro criado com sucesso',
          description: result.temporarySenha
            ? `Senha temporária: ${result.temporarySenha}. O barbeiro deve alterar no primeiro login.`
            : 'O barbeiro pode fazer login agora.',
        });
        setModalOpen(false);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refetch();
      } catch (error: any) {
        toast({ title: 'Erro ao criar barbeiro', description: error.message, variant: 'destructive' });
      } finally {
        setSaving(false);
      }
      return;
    }

    // Regular update/create without email
    setSaving(true);
    const { error } = editing.id
      ? await atualizar(editing.id, editing as any)
      : await criar(editing as any);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: (error as any).message, variant: 'destructive' });
    } else {
      toast({ title: editing.id ? 'Barbeiro atualizado' : 'Barbeiro criado' });
      setModalOpen(false);
    }
  };

  const handleToggle = async (b: Barbeiro) => {
    const { error } = await toggleAtivo(b.id, !b.ativo);
    if (!error) toast({ title: b.ativo ? 'Barbeiro desativado' : 'Barbeiro ativado' });
  };

  const openCreate = () => { setEditing({ ...emptyBarbeiro }); setIsNewBarbeiro(true); setModalOpen(true); };
  const openEdit = (b: Barbeiro) => { setEditing({ ...b }); setIsNewBarbeiro(false); setModalOpen(true); };
  const openDetalhes = (b: Barbeiro) => { setSelectedBarbeiro(b); setDetalhesOpen(true); };

  return (
    <PageContainer title="Barbeiros" subtitle="Gerencie a equipe de barbeiros">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar barbeiro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filtroAtivo}
            onChange={(e) => setFiltroAtivo(e.target.value as any)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="todos">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
          <Button onClick={openCreate} className="gap-2">
            <Plus size={16} /> Novo barbeiro
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Users size={48} className="mx-auto mb-4 text-primary/40" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Nenhum barbeiro encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">Adicione barbeiros para começar.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`glass rounded-2xl p-5 transition-all cursor-pointer hover:border-primary/30 hover:shadow-gold ${!b.ativo ? 'opacity-60' : ''}`}
              onClick={() => openDetalhes(b)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                    {(b.nome || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-foreground">{b.nome}</h3>
                    <p className="text-xs text-muted-foreground">{b.especialidade || 'Barbeiro'}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${b.ativo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-destructive/20 text-destructive'}`}>
                  {b.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>📞 {b.telefone || '—'}</p>
                <p>💰 Comissão: {b.comissao ?? 0}%</p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={(e) => { e.stopPropagation(); openEdit(b); }}>
                  <Pencil size={12} /> Editar
                </Button>
                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={(e) => { e.stopPropagation(); handleToggle(b); }}>
                  <Power size={12} /> {b.ativo ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing.id ? 'Editar Barbeiro' : 'Novo Barbeiro'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome *</Label>
              <Input value={editing.nome || ''} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} />
            </div>
            <div>
              <Label>Telefone *</Label>
              <Input value={editing.telefone || ''} onChange={(e) => setEditing({ ...editing, telefone: e.target.value })} />
            </div>
            <div>
              <Label>Especialidade</Label>
              <Input value={editing.especialidade || ''} onChange={(e) => setEditing({ ...editing, especialidade: e.target.value })} />
            </div>
            <div>
              <Label>Comissão (%)</Label>
              <Input type="number" value={editing.comissao ?? 50} onChange={(e) => setEditing({ ...editing, comissao: parseFloat(e.target.value) })} />
            </div>
            <div>
              <ImageUpload
                value={editing.foto || null}
                onChange={(url) => setEditing({ ...editing, foto: url })}
                bucket="barbeiros"
                label="Foto do Barbeiro"
              />
            </div>
            {isNewBarbeiro && (
              <>
                <div>
                  <Label>Email do Barbeiro {editing.email ? '' : '(opcional)'}</Label>
                  <Input
                    type="email"
                    value={editing.email || ''}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                    placeholder="barbeiro@email.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Se fornecido, o barbeiro poderá fazer login com suas credenciais.
                  </p>
                </div>
                {editing.email && (
                  <div>
                    <Label>Senha Temporária (opcional)</Label>
                    <Input
                      type="password"
                      value={editing.senha || ''}
                      onChange={(e) => setEditing({ ...editing, senha: e.target.value })}
                      placeholder="Deixe em branco para gerar automaticamente"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Se não preenchida, uma senha será gerada automaticamente.
                    </p>
                  </div>
                )}
              </>
            )}
            <div className="flex items-center gap-2">
              <Switch checked={editing.ativo ?? true} onCheckedChange={(v) => setEditing({ ...editing, ativo: v })} />
              <Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Detalhes */}
      <Dialog open={detalhesOpen} onOpenChange={setDetalhesOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedBarbeiro?.nome || 'Barbeiro'}</DialogTitle>
          </DialogHeader>
          {selectedBarbeiro && (
            <Tabs defaultValue="dados">
              <TabsList className="w-full">
                <TabsTrigger value="dados" className="flex-1">Dados</TabsTrigger>
                <TabsTrigger value="horarios" className="flex-1">Horários</TabsTrigger>
              </TabsList>
              <TabsContent value="dados" className="space-y-3 pt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Telefone:</span> {selectedBarbeiro.telefone || '—'}</div>
                  <div><span className="text-muted-foreground">Especialidade:</span> {selectedBarbeiro.especialidade || '—'}</div>
                  <div><span className="text-muted-foreground">Comissão:</span> {selectedBarbeiro.comissao ?? 0}%</div>
                  <div><span className="text-muted-foreground">Status:</span> {selectedBarbeiro.ativo ? '✅ Ativo' : '❌ Inativo'}</div>
                </div>
              </TabsContent>
              <TabsContent value="horarios" className="pt-4">
                <HorariosEditor barbeiroId={selectedBarbeiro.id} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

function HorariosEditor({ barbeiroId }: { barbeiroId: string }) {
  const { horarios, loading, salvar } = useHorariosBarbeiro(barbeiroId);
  const { toast } = useToast();
  const [local, setLocal] = useState<Omit<HorarioBarbeiro, 'id'>[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!initialized && !loading) {
    setLocal(horarios.map(({ id, ...rest }) => rest));
    setInitialized(true);
  }

  const addHorario = (dia: number) => {
    setLocal([...local, { barbeiro_id: barbeiroId, dia_semana: dia, inicio: '09:00', fim: '18:00' }]);
  };

  const removeHorario = (idx: number) => {
    setLocal(local.filter((_, i) => i !== idx));
  };

  const updateHorario = (idx: number, field: 'inicio' | 'fim', value: string) => {
    const updated = [...local];
    updated[idx] = { ...updated[idx], [field]: value };
    setLocal(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    await salvar(local);
    setSaving(false);
    toast({ title: 'Horários salvos' });
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      {DIAS_SEMANA.map((nome, dia) => {
        const diaHorarios = local.filter((h) => h.dia_semana === dia);
        return (
          <div key={dia} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{nome}</span>
              <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => addHorario(dia)}>
                <Plus size={12} /> Horário
              </Button>
            </div>
            {diaHorarios.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem horário</p>
            ) : (
              diaHorarios.map((h) => {
                const idx = local.indexOf(h);
                return (
                  <div key={idx} className="flex items-center gap-2 mb-1">
                    <Input
                      type="time"
                      value={h.inicio}
                      onChange={(e) => updateHorario(idx, 'inicio', e.target.value)}
                      className="w-28 text-xs"
                    />
                    <span className="text-muted-foreground text-xs">às</span>
                    <Input
                      type="time"
                      value={h.fim}
                      onChange={(e) => updateHorario(idx, 'fim', e.target.value)}
                      className="w-28 text-xs"
                    />
                    <Button size="sm" variant="ghost" className="text-destructive text-xs" onClick={() => removeHorario(idx)}>
                      ✕
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        );
      })}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clock size={16} className="mr-2" />}
        Salvar horários
      </Button>
    </div>
  );
}

export default AdminBarbeiros;
