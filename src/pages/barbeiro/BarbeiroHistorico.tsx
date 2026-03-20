import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import StatusBadge from '@/components/barbeiro/StatusBadge';
import { useBarbeiroProfile, useAgendamentosFiltrados } from '@/hooks/useBarbeiro';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, History } from 'lucide-react';

const BarbeiroHistorico = () => {
  const { barbeiro, loading: loadB } = useBarbeiroProfile();
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];

  const [dataInicio, setDataInicio] = useState(inicioMes);
  const [dataFim, setDataFim] = useState(hoje.toISOString().split('T')[0]);

  const { agendamentos, loading } = useAgendamentosFiltrados(barbeiro?.id, {
    dataInicio,
    dataFim,
    status: 'finalizado',
  });

  const comissaoRate = (barbeiro?.comissao || 50) / 100;

  return (
    <PageContainer title="Histórico" subtitle="Atendimentos finalizados">
      <div className="flex flex-wrap gap-3 mb-6">
        <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-auto" />
        <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-auto" />
      </div>

      {loading || loadB ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : agendamentos.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <History size={48} className="mx-auto mb-4 text-primary/30" />
          <p className="text-muted-foreground">Nenhum atendimento no período.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Barbeiro</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agendamentos.map(a => {
                const preco = a.servicos?.preco || 0;
                return (
                  <TableRow key={a.id}>
                    <TableCell>{a.data?.split('-').reverse().join('/')}</TableCell>
                    <TableCell>{a.hora?.slice(0, 5)}</TableCell>
                    <TableCell>{a.clientes?.nome || '—'}</TableCell>
                    <TableCell>{a.servicos?.nome || '—'}</TableCell>
                    <TableCell>{a.barbeiros?.nome || '—'}</TableCell>
                    <TableCell>R$ {Number(preco).toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell className="text-primary font-semibold">
                      R$ {(Number(preco) * comissaoRate).toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </PageContainer>
  );
};

export default BarbeiroHistorico;
