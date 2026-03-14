import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import RatingStars from '@/components/cliente/RatingStars';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, User, Scissors } from 'lucide-react';
import { mockAgendamentos, mockAvaliacoes, getServicoById, getBarbeiroById } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const ClienteAvaliar = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const agendamento = mockAgendamentos.find(a => a.id === id);
  const jaAvaliado = mockAvaliacoes.some(av => av.agendamento_id === id);

  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!agendamento || agendamento.status !== 'finalizado') {
    return (
      <PageContainer>
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Agendamento não encontrado ou não pode ser avaliado.</p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/cliente/historico')}>
            Voltar ao histórico
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (jaAvaliado) {
    return (
      <PageContainer>
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Este agendamento já foi avaliado. Obrigado!</p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/cliente/historico')}>
            Voltar ao histórico
          </Button>
        </div>
      </PageContainer>
    );
  }

  const servico = getServicoById(agendamento.servico_id);
  const barbeiro = getBarbeiroById(agendamento.barbeiro_id);

  const handleEnviar = async () => {
    if (nota === 0) {
      toast({ title: 'Selecione uma nota', description: 'Toque nas estrelas para avaliar.', variant: 'destructive' });
      return;
    }
    setEnviando(true);
    // TODO: Insert into Supabase avaliacoes table
    await new Promise(r => setTimeout(r, 800));
    toast({ title: '⭐ Avaliação enviada!', description: 'Obrigado pelo seu feedback.' });
    navigate('/cliente/historico');
  };

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl glass text-foreground hover:text-primary transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-heading text-xl font-bold text-foreground">Avaliar Atendimento</h1>
      </div>

      <div className="max-w-md mx-auto">
        {/* Summary */}
        <div className="glass rounded-2xl p-6 mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <User size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Barbeiro</p>
              <p className="text-sm font-medium text-foreground">{barbeiro?.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Scissors size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Serviço</p>
              <p className="text-sm font-medium text-foreground">{servico?.nome}</p>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-foreground mb-3">Como foi sua experiência?</p>
          <div className="flex justify-center">
            <RatingStars value={nota} onChange={setNota} size={36} />
          </div>
          {nota > 0 && (
            <p className="mt-2 text-xs text-primary font-medium">
              {nota === 5 ? 'Excelente!' : nota === 4 ? 'Muito bom!' : nota === 3 ? 'Bom' : nota === 2 ? 'Regular' : 'Ruim'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-2 block">Comentário (opcional)</label>
          <Textarea
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            placeholder="Conte como foi o atendimento..."
            className="glass border-border/50 focus:border-primary"
            rows={4}
          />
        </div>

        <Button variant="gold" size="lg" className="w-full" onClick={handleEnviar} disabled={enviando}>
          <Send size={16} />
          {enviando ? 'Enviando...' : 'Enviar Avaliação'}
        </Button>
      </div>
    </PageContainer>
  );
};

export default ClienteAvaliar;
