import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BarberCardProps {
  barbeiro: {
    id: string;
    nome: string | null;
    foto: string | null;
    especialidade: string | null;
  };
  onAgendar?: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const BarberCard = ({ barbeiro, onAgendar, selected, onSelect }: BarberCardProps) => {
  const initials = barbeiro.nome
    ? barbeiro.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div
      onClick={() => onSelect?.(barbeiro.id)}
      className={`glass rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-gold group ${
        onSelect ? 'cursor-pointer' : ''
      } ${selected ? 'ring-2 ring-primary shadow-gold' : ''}`}
    >
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
        {barbeiro.foto ? (
          <img src={barbeiro.foto} alt={barbeiro.nome || ''} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-primary font-heading">{initials}</span>
        )}
      </div>
      <h3 className="font-heading text-base font-semibold text-foreground">{barbeiro.nome}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{barbeiro.especialidade}</p>
      {onAgendar && (
        <Button
          variant="gold-outline"
          size="sm"
          className="mt-4 w-full"
          onClick={(e) => { e.stopPropagation(); onAgendar(barbeiro.id); }}
        >
          Agendar com {barbeiro.nome?.split(' ')[0]}
        </Button>
      )}
    </div>
  );
};

export default BarberCard;
