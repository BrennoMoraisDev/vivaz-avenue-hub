import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface FidelidadeResumo {
  pontos_ganhos: number;
  pontos_resgatados: number;
  pontos_disponiveis: number;
  total_cortes: number;
  meta_proximo_resgate: number;
  progresso_percentual: number;
}

export interface FidelidadeHistorico {
  id: string;
  pontos: number;
  tipo: 'ganho' | 'resgatado';
  descricao: string | null;
  created_at: string;
}

const META_PADRAO = 10; // 10 cortes = 1 grátis

export function useFidelidade() {
  const { user } = useAuth();
  const [resumo, setResumo] = useState<FidelidadeResumo>({
    pontos_ganhos: 0,
    pontos_resgatados: 0,
    pontos_disponiveis: 0,
    total_cortes: 0,
    meta_proximo_resgate: META_PADRAO,
    progresso_percentual: 0,
  });
  const [historico, setHistorico] = useState<FidelidadeHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFidelidade = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // Busca configuração da meta
      const { data: configData } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', 'fidelidade_pontos_para_resgate')
        .single();

      const meta = configData?.valor ? parseInt((configData as any).valor) : META_PADRAO;

      // Busca histórico de fidelidade
      const { data: histData } = await supabase
        .from('fidelidade')
        .select('*')
        .eq('cliente_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      const hist = (histData || []) as FidelidadeHistorico[];
      setHistorico(hist);

      // Calcula resumo
      const ganhos = hist.filter(h => h.tipo === 'ganho').reduce((s, h) => s + h.pontos, 0);
      const resgatados = hist.filter(h => h.tipo === 'resgatado').reduce((s, h) => s + h.pontos, 0);
      const disponiveis = ganhos - resgatados;
      const totalCortes = hist.filter(h => h.tipo === 'ganho').length;
      const progresso = Math.min((disponiveis % meta) / meta * 100, 100);

      setResumo({
        pontos_ganhos: ganhos,
        pontos_resgatados: resgatados,
        pontos_disponiveis: disponiveis,
        total_cortes: totalCortes,
        meta_proximo_resgate: meta,
        progresso_percentual: progresso,
      });
    } catch (err) {
      console.error('Erro ao buscar fidelidade:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFidelidade();
  }, [fetchFidelidade]);

  // Adicionar ponto manualmente (admin/barbeiro)
  const adicionarPonto = async (clienteId: string, agendamentoId?: string) => {
    const { error } = await supabase.from('fidelidade').insert({
      cliente_id: clienteId,
      agendamento_id: agendamentoId || null,
      pontos: 1,
      tipo: 'ganho',
      descricao: 'Corte finalizado',
    } as any);
    if (!error) await fetchFidelidade();
    return { error };
  };

  // Resgatar pontos
  const resgatarPontos = async (clienteId: string, pontos: number, descricao: string) => {
    const { error } = await supabase.from('fidelidade').insert({
      cliente_id: clienteId,
      pontos,
      tipo: 'resgatado',
      descricao,
    } as any);
    if (!error) await fetchFidelidade();
    return { error };
  };

  return {
    resumo,
    historico,
    loading,
    refetch: fetchFidelidade,
    adicionarPonto,
    resgatarPontos,
  };
}

// Hook para admin ver fidelidade de todos os clientes
export function useFidelidadeAdmin() {
  const [ranking, setRanking] = useState<Array<{
    cliente_id: string;
    nome: string | null;
    telefone: string | null;
    pontos_disponiveis: number;
    total_cortes: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('fidelidade')
        .select('cliente_id, pontos, tipo, perfis(nome, telefone)')
        .order('created_at', { ascending: false });

      if (!data) { setLoading(false); return; }

      // Agrupa por cliente
      const map: Record<string, { nome: string | null; telefone: string | null; ganhos: number; resgatados: number; cortes: number }> = {};
      (data as any[]).forEach(row => {
        if (!map[row.cliente_id]) {
          map[row.cliente_id] = {
            nome: row.perfis?.nome || null,
            telefone: row.perfis?.telefone || null,
            ganhos: 0,
            resgatados: 0,
            cortes: 0,
          };
        }
        if (row.tipo === 'ganho') {
          map[row.cliente_id].ganhos += row.pontos;
          map[row.cliente_id].cortes += 1;
        } else {
          map[row.cliente_id].resgatados += row.pontos;
        }
      });

      const result = Object.entries(map).map(([cliente_id, v]) => ({
        cliente_id,
        nome: v.nome,
        telefone: v.telefone,
        pontos_disponiveis: v.ganhos - v.resgatados,
        total_cortes: v.cortes,
      })).sort((a, b) => b.pontos_disponiveis - a.pontos_disponiveis);

      setRanking(result);
    } catch (err) {
      console.error('Erro ao buscar ranking fidelidade:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRanking(); }, [fetchRanking]);

  return { ranking, loading, refetch: fetchRanking };
}
