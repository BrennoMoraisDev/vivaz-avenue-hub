import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useServicos, useCategorias, type Servico } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Pencil, Trash2, Power, Loader2, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';

const emptyServico: Partial<Servico> = {
  nome: '', descricao: '', preco: 0, duracao_minutos: 30, categoria_id: null, foto: '', ativo: true,
};

const AdminServicos = () => {
  const { servicos, loading, criar, atualizar, excluir } = useServicos();
  const { categorias } = useCategorias();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filtroCat, setFiltroCat] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Servico>>(emptyServico);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = servicos.filter((s) => {
    const matchSearch = !search || (s.nome || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !filtroCat || s.categoria_id === filtroCat;
    const matchAtivo = filtroAtivo === 'todos' || (filtroAtivo === 'ativo' ? s.ativo : !s.ativo);
    return matchSearch && matchCat && matchAtivo;
  });

  const handleSave = async () => {
    if (!editing.nome) { toast({ title: 'Informe o nome', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = { ...editing };
    if (!payload.categoria_id) delete payload.categoria_id;
    const { error } = editing.id ? await atualizar(editing.id, payload) : await criar(payload);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro', description: (error as any).message, variant: 'destructive' });
    } else {
      toast({ title: editing.id ? 'Serviço atualizado' : 'Serviço criado' });
      setModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await excluir(deleteId);
    if (error) {
      toast({ title: 'Erro', description: (error as any).message, variant: 'destructive' });
    } else {
      toast({ title: 'Serviço excluído' });
    }
    setDeleteId(null);
  };

  const openCreate = () => { setEditing({ ...emptyServico }); setModalOpen(true); };
  const openEdit = (s: Servico) => { setEditing({ ...s }); setModalOpen(true); };

  return (
    <PageContainer title="Serviços" subtitle="Gerencie os serviços oferecidos">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar serviço..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">Todas categorias</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select value={filtroAtivo} onChange={(e) => setFiltroAtivo(e.target.value as any)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="todos">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
          <Button onClick={openCreate} className="gap-2"><Plus size={16} /> Novo serviço</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Scissors size={48} className="mx-auto mb-4 text-primary/40" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Nenhum serviço encontrado</h3>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Preço</th>
                <th className="py-3 px-4">Duração</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`border-b border-border/50 hover:bg-surface-hover transition-colors ${!s.ativo ? 'opacity-50' : ''}`}
                >
                  <td className="py-3 px-4 font-medium text-foreground">{s.nome}</td>
                  <td className="py-3 px-4 text-muted-foreground">{s.categorias_servico?.nome || '—'}</td>
                  <td className="py-3 px-4 text-primary font-semibold">R$ {(s.preco ?? 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-muted-foreground">{s.duracao_minutos} min</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.ativo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-destructive/20 text-destructive'}`}>
                      {s.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(s)}><Pencil size={14} /></Button>
                      <Button size="sm" variant="ghost" onClick={async () => {
                        const { error } = await atualizar(s.id, { ativo: !s.ativo } as any);
                        if (!error) toast({ title: s.ativo ? 'Desativado' : 'Ativado' });
                      }}><Power size={14} /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing.id ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Nome *</Label><Input value={editing.nome || ''} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} /></div>
            <div><Label>Descrição</Label><Textarea value={editing.descricao || ''} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={editing.preco ?? 0} onChange={(e) => setEditing({ ...editing, preco: parseFloat(e.target.value) })} /></div>
              <div><Label>Duração (min)</Label><Input type="number" value={editing.duracao_minutos ?? 30} onChange={(e) => setEditing({ ...editing, duracao_minutos: parseInt(e.target.value) })} /></div>
            </div>
            <div>
              <Label>Categoria</Label>
              <select
                value={editing.categoria_id || ''}
                onChange={(e) => setEditing({ ...editing, categoria_id: e.target.value || null })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sem categoria</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div><Label>Foto (URL)</Label><Input value={editing.foto || ''} onChange={(e) => setEditing({ ...editing, foto: e.target.value })} placeholder="https://..." /></div>
            <div className="flex items-center gap-2">
              <Switch checked={editing.ativo ?? true} onCheckedChange={(v) => setEditing({ ...editing, ativo: v })} />
              <Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir serviço?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. Serviços com agendamentos não podem ser excluídos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default AdminServicos;
