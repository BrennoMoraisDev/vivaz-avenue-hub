import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import StepIndicator from '@/components/cliente/StepIndicator';
import ServiceCard from '@/components/cliente/ServiceCard';
import BarberCard from '@/components/cliente/BarberCard';
import TimeSlotPicker from '@/components/cliente/TimeSlotPicker';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDisponibilidade, useDiasTrabalho } from '@/hooks/useDisponibilidade';
import { useServicos } from '@/hooks/useServicos';
import { useBarbeiros } from '@/hooks/useBarbeiros';
import { useAuth } from '@/hooks/useAuth';
import { formatPreco, formatDuracao } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Check, CalendarDays, User, Scissors, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ClienteAgendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(0);
  const [servicoId, setServicoId] = useState<string | null>(null);
  const [barbeiroId, setBarbeiroId] = useState<string | null>(null);
  const [data, setData] = useState<Date | undefined>(undefined);
  const [hora, setHora] = useState<string | null>(null);
  const [observacao, setObservacao] = useState('');
  const [saving, setSaving] = useState(false);

  const { servicos, loading: loadingServicos } = useServicos();
  const { barbeiros, loading: loadingBarbeiros } = useBarbeiros();

  // Pre-select from URL params
  useEffect(() => {
    if (loadingServicos || loadingBarbeiros) return;
    
    const srvParam = searchParams.get('servico');
    const barParam = searchParams.get('barbeiro');
    
    if (srvParam && servicos.find(s => s.id === srvParam)) {
      setServicoId(srvParam);
      setStep(1);
    }
    if (barParam && barbeiros.find(b => b.id === barParam)) {
      setBarbeiroId(barParam);
      if (!srvParam) setStep(0);
      else setStep(2);
    }
  }, [searchParams, servicos, barbeiros, loadingServicos, loadingBarbeiros]);

  const dataStr = data ? format(data, 'yyyy-MM-dd') : null;
  const slots = useDisponibilidade(barbeiroId, dataStr, servicoId);
  const diasTrabalho = useDiasTrabalho(barbeiroId);

  const servico = servicos.find(s => s.id === servicoId);
  const barbeiro = barbeiros.find(b => b.id === barbeiroId);

  const handleBack = () => {
    if (step === 0) navigate(-1);
    else {
      if (step === 4) setHora(null);
      if (step === 3) setData(undefined);
      setStep(step - 1);
    }
  };

  const handleConfirm = async () => {
    if (!profile?.id || !barbeiroId || !servicoId || !dataStr || !hora) {
      toast({ title: 'Erro no agendamento', description: 'Dados incompletos.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('agendamentos')
        .insert({
          cliente_id: profile.id,
          barbeiro_id: barbeiroId,
          servico_id: servicoId,
          data: dataStr,
          hora: hora,
          status: 'agendado',
          observacao: observacao || null
        });

      if (error) throw error;

      toast({
        title: '✅ Agendamento confirmado!',
        description: `${servico?.nome} com ${barbeiro?.nome} em ${format(data!, "dd/MM/yyyy")} às ${hora}`,
      });
      navigate('/cliente/historico');
    } catch (error: any) {
      toast({ title: 'Erro ao agendar', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const disabledDays = (date: Date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
    return !diasTrabalho.has(date.getDay());
  };

  if (loadingServicos || loadingBarbeiros) {
    return (
      <PageContainer>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={handleBack} className="flex h-9 w-9 items-center justify-center rounded-xl glass text-foreground hover:text-primary transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-heading text-xl font-bold text-foreground">Agendar Horário</h1>
      </div>

      <div className="mb-8">
        <StepIndicator current={step} />
      </div>

      {/* Step 0: Serviço */}
      {step === 0 && (
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Escolha o serviço</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {servicos.map(s => (
              <ServiceCard
                key={s.id}
                servico={s}
                selected={servicoId === s.id}
                onSelect={(id) => { setServicoId(id); setStep(1); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Barbeiro */}
      {step === 1 && (
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Escolha o barbeiro</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {barbeiros.map(b => (
              <BarberCard
                key={b.id}
                barbeiro={b}
                selected={barbeiroId === b.id}
                onSelect={(id) => { setBarbeiroId(id); setStep(2); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Data */}
      {step === 2 && (
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Escolha a data</h2>
          <div className="flex justify-center">
            <div className="glass rounded-2xl p-4 inline-block">
              <Calendar
                mode="single"
                selected={data}
                onSelect={(d) => { if (d) { setData(d); setStep(3); } }}
                disabled={disabledDays}
                locale={ptBR}
                className={cn("p-3 pointer-events-auto")}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Horário */}
      {step === 3 && (
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-2">Escolha o horário</h2>
          {data && (
            <p className="text-sm text-muted-foreground mb-4">
              {format(data, "EEEE, dd 'de' MMMM", { locale: ptBR })} • {barbeiro?.nome}
            </p>
          )}
          <TimeSlotPicker
            slots={slots}
            selected={hora}
            onSelect={(h) => { setHora(h); setStep(4); }}
          />
        </div>
      )}

      {/* Step 4: Confirmação */}
      {step === 4 && (
        <div className="max-w-md mx-auto">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-6">Confirme seu agendamento</h2>

          <div className="glass rounded-2xl p-6 space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Scissors size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Serviço</p>
                <p className="text-sm font-medium text-foreground">{servico?.nome}</p>
                <p className="text-xs text-primary font-semibold">
                  {formatPreco(servico?.preco)} • {formatDuracao(servico?.duracao_minutos)}
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <User size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Barbeiro</p>
                <p className="text-sm font-medium text-foreground">{barbeiro?.nome}</p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <CalendarDays size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data e horário</p>
                <p className="text-sm font-medium text-foreground">
                  {data && format(data, "dd/MM/yyyy")} às {hora}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Observação (opcional)</label>
            <Textarea
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              placeholder="Ex: Preferência por máquina, alergias..."
              className="glass border-border/50 focus:border-primary"
              rows={3}
            />
          </div>

          <Button variant="gold" size="lg" className="w-full" onClick={handleConfirm} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check size={18} />}
            Confirmar Agendamento
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default ClienteAgendar;
