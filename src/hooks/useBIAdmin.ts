import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface HeatmapData {
  hora: string;
  dia: string;
  total: number;
}

export interface ComissaoRelatorio {
  barbeiro_id: string;
  nome: string | null;
  foto: string | null;
  comissao_percentual: number;
  total_atendimentos: number;
  faturamento_bruto: number;
  comissao_valor: number;
  ticket_medio: number;
}

export interface TicketMedioCliente {
  cliente_id: string;
  nome: string | null;
  telefone: string | null;
  total_atendimentos: number;
  gasto_total: number;
  ticket_medio: number;
  ultimo_agendamento: string | null;
  servico_favorito: string | null;
}

export interface BIMetrics {
  ticketMedioGeral: number;
  faturamentoTotal: number;
  totalAtendimentos: number;
  taxaCancelamento: number;
  clientesAtivos: number;
}

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HORAS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];

export function useBIAdmin(periodo: { inicio: string; fim: string }) {
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [comissoes, setComissoes] = useState<ComissaoRelatorio[]>([]);
  const [ticketClientes, setTicketClientes] = useState<TicketMedioCliente[]>([]);
  const [metrics, setMetrics] = useState<BIMetrics>({
    ticketMedioGeral: 0,
    faturamentoTotal: 0,
    totalAtendimentos: 0,
    taxaCancelamento: 0,
    clientesAtivos: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchBI = useCallback(async () => {
    setLoading(true);
    try {
      // Busca todos os agendamentos do período
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('*, servicos(nome, preco), barbeiros(nome, foto, comissao), clientes(nome, telefone)')
        .gte('data', periodo.inicio)
        .lte('data', periodo.fim)
        .order('data');

      if (!agendamentos) { setLoading(false); return; }

      // ─── Heatmap de Horários ───────────────────────────────────────────────
      const heatmapMap: Record<string, number> = {};
      DIAS.forEach(dia => {
        HORAS.forEach(hora => {
          heatmapMap[`${dia}-${hora}`] = 0;
        });
      });

      agendamentos.forEach((ag: any) => {
        if (!ag.data || !ag.hora) return;
        const diaSemana = new Date(ag.data + 'T12:00:00').getDay();
        const hora = ag.hora.slice(0, 2);
        const key = `${DIAS[diaSemana]}-${hora}`;
        if (heatmapMap[key] !== undefined) {
          heatmapMap[key]++;
        }
      });

      const heatmapData: HeatmapData[] = [];
      HORAS.forEach(hora => {
        DIAS.forEach(dia => {
          heatmapData.push({ hora, dia, total: heatmapMap[`${dia}-${hora}`] || 0 });
        });
      });
      setHeatmap(heatmapData);

      // ─── Comissões por Barbeiro ────────────────────────────────────────────
      const barbeiroMap: Record<string, {
        nome: string | null;
        foto: string | null;
        comissao_percentual: number;
        atendimentos: number;
        faturamento: number;
      }> = {};

      agendamentos
        .filter((ag: any) => ag.status === 'finalizado')
        .forEach((ag: any) => {
          const bId = ag.barbeiro_id;
          if (!barbeiroMap[bId]) {
            barbeiroMap[bId] = {
              nome: ag.barbeiros?.nome || null,
              foto: ag.barbeiros?.foto || null,
              comissao_percentual: ag.barbeiros?.comissao || 50,
              atendimentos: 0,
              faturamento: 0,
            };
          }
          barbeiroMap[bId].atendimentos++;
          barbeiroMap[bId].faturamento += ag.servicos?.preco || 0;
        });

      const comissoesData: ComissaoRelatorio[] = Object.entries(barbeiroMap).map(([id, b]) => ({
        barbeiro_id: id,
        nome: b.nome,
        foto: b.foto,
        comissao_percentual: b.comissao_percentual,
        total_atendimentos: b.atendimentos,
        faturamento_bruto: b.faturamento,
        comissao_valor: b.faturamento * (b.comissao_percentual / 100),
        ticket_medio: b.atendimentos > 0 ? b.faturamento / b.atendimentos : 0,
      })).sort((a, b) => b.faturamento_bruto - a.faturamento_bruto);

      setComissoes(comissoesData);

      // ─── Ticket Médio por Cliente ──────────────────────────────────────────
      const clienteMap: Record<string, {
        nome: string | null;
        telefone: string | null;
        atendimentos: number;
        gasto: number;
        ultimo: string | null;
        servicos: Record<string, number>;
      }> = {};

      agendamentos
        .filter((ag: any) => ag.status === 'finalizado')
        .forEach((ag: any) => {
          const cId = ag.cliente_id;
          if (!clienteMap[cId]) {
            clienteMap[cId] = {
              nome: ag.clientes?.nome || null,
              telefone: ag.clientes?.telefone || null,
              atendimentos: 0,
              gasto: 0,
              ultimo: null,
              servicos: {},
            };
          }
          clienteMap[cId].atendimentos++;
          clienteMap[cId].gasto += ag.servicos?.preco || 0;
          if (!clienteMap[cId].ultimo || ag.data > clienteMap[cId].ultimo!) {
            clienteMap[cId].ultimo = ag.data;
          }
          const svcNome = ag.servicos?.nome || 'Outro';
          clienteMap[cId].servicos[svcNome] = (clienteMap[cId].servicos[svcNome] || 0) + 1;
        });

      const ticketData: TicketMedioCliente[] = Object.entries(clienteMap).map(([id, c]) => {
        const servicoFavorito = Object.entries(c.servicos).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        return {
          cliente_id: id,
          nome: c.nome,
          telefone: c.telefone,
          total_atendimentos: c.atendimentos,
          gasto_total: c.gasto,
          ticket_medio: c.atendimentos > 0 ? c.gasto / c.atendimentos : 0,
          ultimo_agendamento: c.ultimo,
          servico_favorito: servicoFavorito,
        };
      }).sort((a, b) => b.gasto_total - a.gasto_total);

      setTicketClientes(ticketData);

      // ─── Métricas Gerais ───────────────────────────────────────────────────
      const finalizados = agendamentos.filter((ag: any) => ag.status === 'finalizado');
      const cancelados = agendamentos.filter((ag: any) => ag.status === 'cancelado');
      const faturamentoTotal = finalizados.reduce((s: number, ag: any) => s + (ag.servicos?.preco || 0), 0);
      const clientesUnicos = new Set(finalizados.map((ag: any) => ag.cliente_id)).size;

      setMetrics({
        ticketMedioGeral: finalizados.length > 0 ? faturamentoTotal / finalizados.length : 0,
        faturamentoTotal,
        totalAtendimentos: finalizados.length,
        taxaCancelamento: agendamentos.length > 0 ? (cancelados.length / agendamentos.length) * 100 : 0,
        clientesAtivos: clientesUnicos,
      });

    } catch (err) {
      console.error('Erro ao buscar BI:', err);
    } finally {
      setLoading(false);
    }
  }, [periodo.inicio, periodo.fim]);

  useEffect(() => { fetchBI(); }, [fetchBI]);

  return { heatmap, comissoes, ticketClientes, metrics, loading, refetch: fetchBI };
}
