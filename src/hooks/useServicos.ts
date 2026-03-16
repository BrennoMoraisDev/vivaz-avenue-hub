import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Servico {
  id: string;
  nome: string | null;
  descricao: string | null;
  preco: number | null;
  duracao_minutos: number | null;
  categoria_id: string | null;
  foto: string | null;
  ativo: boolean;
  created_at: string;
  categorias_servico?: { nome: string | null } | null;
}

export interface Categoria {
  id: string;
  nome: string | null;
  ordem: number | null;
}

export function useServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: servicosData }, { data: categoriasData }] = await Promise.all([
        supabase
          .from('servicos')
          .select('*, categorias_servico(nome)')
          .eq('ativo', true)
          .order('nome'),
        supabase
          .from('categorias_servico')
          .select('*')
          .order('ordem'),
      ]);
      
      setServicos((servicosData as Servico[]) || []);
      setCategorias((categoriasData as Categoria[]) || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { servicos, categorias, loading, refetch: fetch };
}
