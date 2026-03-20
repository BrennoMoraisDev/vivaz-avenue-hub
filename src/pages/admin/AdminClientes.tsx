import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useAdminClientes } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Pencil, Loader2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminClientes = () => {
  const { clientes, loading, atualizar } = useAdminClientes();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; nome: string; telefone: string; email: string }>({ id: '', nome: '', telefone: '', email: '' });
  const [saving, setSaving] = useState(false);

  const filtered = clientes.filter(
    (c) => !search || (c.nome || '').toLowerCase().includes(search.toLowerCase()) || (c.telefone || '').includes(search)
  );

  const handleSave = async () => {
    setSaving(true);
    const { error } = await atualizar(editing.id, { nome: editing.nome, telefone: editing.telefone, email: editing.email });
    setSaving(false);
    if (error) toast({ title: 'Erro', description: (error as any).message, variant: 'destructive' });
    else { toast({ title: 'Cliente atualizado' }); setEditOpen(false); }
  };

  return (
    <PageContainer title="Clientes" subtitle="Base de clientes da barbearia">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Users size={48} className="mx-auto mb-4 text-primary/40" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Nenhum cliente encontrado</h3>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Telefone</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Cadastro</th>
                <th className="py-3 px-4">Agendamentos</th>
                <th className="py-3 px-4">Último</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 hover:bg-surface-hover transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-foreground">{c.nome || '—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{c.telefone || '—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{c.email || '—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                  <td className="py-3 px-4 text-center text-foreground">{c.totalAgendamentos}</td>
                  <td className="py-3 px-4 text-muted-foreground">{c.ultimoAgendamento || '—'}</td>
                  <td className="py-3 px-4 text-right">
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditing({ id: c.id, nome: c.nome || '', telefone: c.telefone || '', email: c.email || '' });
                      setEditOpen(true);
                    }}><Pencil size={14} /></Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Nome</Label><Input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} /></div>
            <div><Label>Telefone</Label><Input value={editing.telefone} onChange={(e) => setEditing({ ...editing, telefone: e.target.value })} /></div>
            <div><Label>E-mail</Label><Input value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default AdminClientes;
