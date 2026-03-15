import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useClientesSearch, ClienteBusca } from '@/hooks/useBarbeiro';
import { Search, User } from 'lucide-react';

interface Props {
  onSelect: (cliente: ClienteBusca) => void;
  onNewClient: () => void;
}

export default function ClienteSearchInput({ onSelect, onNewClient }: Props) {
  const [termo, setTermo] = useState('');
  const [open, setOpen] = useState(false);
  const { results, search } = useClientesSearch();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => search(termo), 300);
    return () => clearTimeout(t);
  }, [termo, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente por nome ou telefone..."
          value={termo}
          onChange={(e) => { setTermo(e.target.value); setOpen(true); }}
          className="pl-9"
        />
      </div>
      {open && termo.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl glass-strong border border-border p-1 max-h-60 overflow-auto">
          {results.map((c) => (
            <button
              key={c.id}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-primary/10 transition-colors"
              onClick={() => { onSelect(c); setTermo(c.nome || ''); setOpen(false); }}
            >
              <User size={16} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{c.nome}</p>
                <p className="text-xs text-muted-foreground">{c.telefone}</p>
              </div>
            </button>
          ))}
          {results.length === 0 && (
            <button
              className="w-full rounded-lg px-3 py-3 text-left hover:bg-primary/10 transition-colors"
              onClick={() => { onNewClient(); setOpen(false); }}
            >
              <p className="text-sm text-primary font-medium">+ Cadastrar novo cliente</p>
              <p className="text-xs text-muted-foreground">Nenhum resultado encontrado</p>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
