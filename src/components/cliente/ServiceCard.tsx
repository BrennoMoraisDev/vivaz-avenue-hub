import { Scissors, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPreco, formatDuracao } from '@/lib/format';

interface ServiceCardProps {
  servico: {
    id: string;
    nome: string | null;
    descricao: string | null;
    preco: number | null;
    duracao_minutos: number | null;
    categoria_id: string | null;
    foto: string | null;
    categorias_servico?: { nome: string | null } | null;
  };
  onAgendar?: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const ServiceCard = ({ servico, onAgendar, selected, onSelect }: ServiceCardProps) => {
  const categoriaNome = servico.categorias_servico?.nome;

  return (
    <div
      onClick={() => onSelect?.(servico.id)}
      className={`glass rounded-2xl p-6 transition-all duration-300 hover:shadow-gold group ${
        onSelect ? 'cursor-pointer' : ''
      } ${selected ? 'ring-2 ring-primary shadow-gold' : ''}`}
    >
      {/* Image / Placeholder */}
      <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-secondary/50 overflow-hidden">
        {servico.foto ? (
          <img src={servico.foto} alt={servico.nome || ''} className="h-full w-full object-cover" />
        ) : (
          <Scissors size={32} className="text-primary/30" />
        )}
      </div>

      {/* Category badge */}
      {categoriaNome && (
        <span className="inline-block mb-2 rounded-full bg-primary/10 px-3 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
          {categoriaNome}
        </span>
      )}

      {/* Info */}
      <h3 className="font-heading text-base font-semibold text-foreground">{servico.nome}</h3>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{servico.descricao}</p>

      {/* Price & Duration */}
      <div className="mt-4 flex items-center justify-between">
        <span className="font-heading text-lg font-bold text-primary">
          {formatPreco(servico.preco)}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{formatDuracao(servico.duracao_minutos)}</span>
        </div>
      </div>

      {/* Action */}
      {onAgendar && (
        <Button
          variant="gold-outline"
          size="sm"
          className="mt-4 w-full"
          onClick={(e) => { e.stopPropagation(); onAgendar(servico.id); }}
        >
          Agendar
        </Button>
      )}
    </div>
  );
};

export default ServiceCard;
