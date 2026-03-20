import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Barbeiro {
  id: string;
  nome: string | null;
  foto: string | null;
  telefone: string | null;
  especialidade: string | null;
  comissao: number | null;
  ativo: boolean;
  user_id: string | null;
  created_at: string;
}

export function useBarbeiros() {
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('barbeiros')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      setBarbeiros((data as Barbeiro[]) || []);
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { barbeiros, loading, refetch: fetch };
}
