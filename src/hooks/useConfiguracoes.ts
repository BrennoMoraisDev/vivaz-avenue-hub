import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Configuracoes {
  nome_barbearia: string;
  telefone: string;
  email: string;
  endereco: string;
  whatsapp_numero: string;
  horario_abertura: string;
  horario_fechamento: string;
  intervalo_minutos: string;
  fidelidade_ativo: string;
  fidelidade_pontos_por_corte: string;
  fidelidade_pontos_para_resgate: string;
  dias_retorno_lembrete: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  google_maps_url: string;
  [key: string]: string;
}

const DEFAULTS: Configuracoes = {
  nome_barbearia: 'Vivaz Barbearia Avenue',
  telefone: '',
  email: '',
  endereco: '',
  whatsapp_numero: '',
  horario_abertura: '08:00',
  horario_fechamento: '20:00',
  intervalo_minutos: '30',
  fidelidade_ativo: 'true',
  fidelidade_pontos_por_corte: '1',
  fidelidade_pontos_para_resgate: '10',
  dias_retorno_lembrete: '20',
  instagram_url: '',
  facebook_url: '',
  tiktok_url: '',
  google_maps_url: '',
};

export function useConfiguracoes() {
  const [configs, setConfigs] = useState<Configuracoes>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('configuracoes').select('*');
      if (data) {
        const map = { ...DEFAULTS };
        (data as any[]).forEach((c: any) => {
          if (c.chave) map[c.chave] = c.valor || '';
        });
        setConfigs(map);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { configs, loading, fidelidadeAtivo: configs.fidelidade_ativo === 'true' };
}
