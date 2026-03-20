import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useCategorias, type Categoria } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminCategorias = () => {
  const { categorias, loading, criar, atualizar, excluir } = useCategorias();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Categoria>>({ nome: '', ordem: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!editing.nome) { toast({ title: 'Informe o nome', variant: 'destructive' }); return; }
    setSaving(true);
    const { error } = editing.id ? await atualizar(editing.id, editing) : await criar(editing);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro', description: (error as any).message, variant: 'destructive' });
    } else {
      toast({ title: editing.id ? 'Categoria atualizada' : 'Categoria criada' });
      setModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await excluir(deleteId);
    if (error) toast({ title: 'Erro', description: (error as any).message, variant: 'destructive' });
    else toast({ title: 'Categoria excluída' });
    setDeleteId(null);
  };

  return (
    <PageContainer title="Categorias" subtitle="Organize as categorias de serviços">
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setEditing({ nome: '', ordem: (categorias.length + 1) * 10 }); setModalOpen(true); }} className="gap-2">
          <Plus size={16} /> Nova categoria
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : categorias.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Tag size={48} className="mx-auto mb-4 text-primary/40" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Nenhuma categoria</h3>
          <p className="mt-2 text-sm text-muted-foreground">Crie categorias para organizar os serviços.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categorias.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  {c.ordem ?? i + 1}
                </div>
                <span className="text-sm font-medium text-foreground">{c.nome}</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => { setEditing({ ...c }); setModalOpen(true); }}>
                  <Pencil size={14} />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(c.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editing.id ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Nome *</Label><Input value={editing.nome || ''} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} /></div>
            <div><Label>Ordem</Label><Input type="number" value={editing.ordem ?? 0} onChange={(e) => setEditing({ ...editing, ordem: parseInt(e.target.value) })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>Categorias com serviços vinculados não podem ser excluídas.</AlertDialogDescription>
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

export default AdminCategorias;
