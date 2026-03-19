import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Settings, Save, Loader2, Star, MessageCircle, Bell, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConfigItem {
  chave: string;
  valor: string;
  tipo: string;
  descricao: string | null;
}

const AdminConfiguracoes = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<Record<string, string>>({
    nome_barbearia: 'Vivaz Barbearia Avenue',
    horario_abertura: '08:00',
    horario_fechamento: '20:00',
    intervalo_minutos: '30',
    telefone: '',
    email: '',
    endereco: '',
    whatsapp_numero: '',
    fidelidade_ativo: 'true',
    fidelidade_pontos_por_corte: '1',
    fidelidade_pontos_para_resgate: '10',
    dias_retorno_lembrete: '20',
  });

  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true);
      const { data } = await supabase.from('configuracoes').select('*');
      if (data) {
        const map: Record<string, string> = { ...configs };
        (data as ConfigItem[]).forEach(c => {
          map[c.chave] = c.valor || '';
        });
        setConfigs(map);
      }
      setLoading(false);
    };
    fetchConfigs();
  }, []);

  const update = (key: string, value: string) => setConfigs(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const upserts = Object.entries(configs).map(([chave, valor]) => ({
        chave,
        valor,
        tipo: typeof valor === 'boolean' ? 'boolean' : 'string',
      }));

      const { error } = await (supabase
        .from('configuracoes') as any)
        .upsert(upserts, { onConflict: 'chave' });

      if (error) throw error;
      toast({ title: 'Configurações salvas com sucesso!' });
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    {
      icon: Settings,
      title: 'Dados da Barbearia',
      fields: [
        { key: 'nome_barbearia', label: 'Nome da barbearia', type: 'text' },
        { key: 'telefone', label: 'Telefone', type: 'tel', placeholder: '(11) 99999-9999' },
        { key: 'email', label: 'E-mail de contato', type: 'email' },
        { key: 'endereco', label: 'Endereço', type: 'text' },
      ],
    },
    {
      icon: Clock,
      title: 'Horários de Funcionamento',
      fields: [
        { key: 'horario_abertura', label: 'Horário de abertura', type: 'time' },
        { key: 'horario_fechamento', label: 'Horário de fechamento', type: 'time' },
        { key: 'intervalo_minutos', label: 'Intervalo entre agendamentos (min)', type: 'number' },
      ],
    },
    {
      icon: MessageCircle,
      title: 'Integração WhatsApp',
      fields: [
        {
          key: 'whatsapp_numero',
          label: 'Número WhatsApp da barbearia',
          type: 'tel',
          placeholder: '5511999999999 (com DDI)',
          hint: 'Número completo com DDI (55) e DDD, sem espaços ou símbolos. Ex: 5511999999999',
        },
      ],
    },
    {
      icon: Star,
      title: 'Programa de Fidelidade',
      fields: [
        { key: 'fidelidade_pontos_por_corte', label: 'Pontos ganhos por corte', type: 'number' },
        { key: 'fidelidade_pontos_para_resgate', label: 'Pontos para corte grátis', type: 'number' },
      ],
    },
    {
      icon: Bell,
      title: 'Lembretes de Retorno',
      fields: [
        {
          key: 'dias_retorno_lembrete',
          label: 'Dias sem visita para lembrete',
          type: 'number',
          hint: 'Clientes que não visitam há X dias aparecerão na lista de lembretes',
        },
      ],
    },
  ];

  return (
    <PageContainer title="Configurações" subtitle="Ajustes gerais do sistema">
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-2xl space-y-6">
          {sections.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.06 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <section.icon size={18} className="text-primary" />
                </div>
                <h2 className="font-heading text-base font-semibold text-foreground">{section.title}</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {section.fields.map(field => (
                  <div key={field.key} className={field.hint ? 'sm:col-span-2' : ''}>
                    <Label className="text-sm">{field.label}</Label>
                    <Input
                      type={field.type}
                      value={configs[field.key] || ''}
                      onChange={e => update(field.key, e.target.value)}
                      placeholder={(field as any).placeholder}
                      className="mt-1"
                    />
                    {(field as any).hint && (
                      <p className="text-xs text-muted-foreground mt-1">{(field as any).hint}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Toggle para fidelidade */}
              {section.title === 'Programa de Fidelidade' && (
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => update('fidelidade_ativo', configs.fidelidade_ativo === 'true' ? 'false' : 'true')}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      configs.fidelidade_ativo === 'true' ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        configs.fidelidade_ativo === 'true' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <Label className="cursor-pointer text-sm">
                    Programa de fidelidade {configs.fidelidade_ativo === 'true' ? 'ativo' : 'inativo'}
                  </Label>
                </div>
              )}
            </motion.div>
          ))}

          <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
            Salvar todas as configurações
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default AdminConfiguracoes;
