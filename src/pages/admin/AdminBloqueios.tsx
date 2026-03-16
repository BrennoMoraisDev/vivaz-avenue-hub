import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useAdminBloqueios, useBarbeiros } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, CalendarOff } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminBloqueios = () => {
  const { bloqueios, loading, criar, excluir } = useAdminBloqueios();
  const { barbeiros } = useBarbeiros();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ barbeiro_id: '', data: '', motivo: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.barbeiro_id || !form.data) { toast({ title: 'Selecione barbeiro e data', variant: 'destructive' }); return; }
    setSaving(true);
    const { error } = await criar({ barbeiro_id: form.barbeiro_id, data: form.data, motivo: form.motivo || undefined });
    setSaving(false);
    if (error) toast({ title: 'Erro', description: (error as any).message, variant: 'destructive' });
    else { toast({ title: 'Bloqueio criado' }); setModalOpen(false); setForm({ barbeiro_id: '', data: '', motivo: '' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await excluir(deleteId);
    if (error) toast({ title: 'Erro', variant: 'destructive' });
    else toast({ title: 'Bloqueio removido' });
    setDeleteId(null);
  };

  return (
    <PageContainer title="Bloqueios de Agenda" subtitle="Gerencie folgas e bloqueios dos barbeiros">
      <div className="flex justify-end mb-6">
        <Button onClick={() => setModalOpen(true)} className="gap-2"><Plus size={16} /> Novo bloqueio</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : bloqueios.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <CalendarOff size={48} className="mx-auto mb-4 text-primary/40" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Nenhum bloqueio cadastrado</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {bloqueios.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="glass rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                  <CalendarOff size={18} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{b.barbeiros?.nome || 'Barbeiro'}</p>
                  <p className="text-xs text-muted-foreground">{b.data} {b.motivo ? `• ${b.motivo}` : ''}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(b.id)}>
                <Trash2 size={14} />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Novo Bloqueio</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Barbeiro *</Label>
              <select
                value={form.barbeiro_id}
                onChange={(e) => setForm({ ...form, barbeiro_id: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {barbeiros.filter((b) => b.ativo).map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
              </select>
            </div>
            <div><Label>Data *</Label><Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} /></div>
            <div><Label>Motivo</Label><Input value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} placeholder="Folga, férias, etc." /></div>
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
            <AlertDialogTitle>Remover bloqueio?</AlertDialogTitle>
            <AlertDialogDescription>O barbeiro ficará disponível nesta data novamente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default AdminBloqueios;
