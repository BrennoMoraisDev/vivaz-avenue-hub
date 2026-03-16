import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import ServiceCard from '@/components/cliente/ServiceCard';
import { Button } from '@/components/ui/button';
import { useServicos } from '@/hooks/useServicos';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

const ClienteServicos = () => {
  const navigate = useNavigate();
  const { servicos, categorias, loading } = useServicos();
  const [categoriaSel, setCategoriaSel] = useState<string | null>(null);

  const servicosFiltrados = categoriaSel
    ? servicos.filter(s => s.categoria_id === categoriaSel)
    : servicos;

  return (
    <PageContainer title="Serviços" subtitle="Conheça nossos serviços e agende o seu">
      {/* Category tabs */}
      {!loading && categorias.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setCategoriaSel(null)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              !categoriaSel ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground hover:text-foreground'
            }`}
          >
            Todos
          </button>
          {categorias.map(c => (
            <button
              key={c.id}
              onClick={() => setCategoriaSel(c.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                categoriaSel === c.id ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {c.nome}
            </button>
          ))}
        </div>
      )}

      {/* Services grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : servicos.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-amber-500/50" />
          <p className="text-sm text-muted-foreground mb-2">Nenhum serviço cadastrado</p>
          <p className="text-xs text-muted-foreground">O administrador ainda não cadastrou serviços. Tente novamente mais tarde.</p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/cliente')}>
            Voltar ao início
          </Button>
        </div>
      ) : servicosFiltrados.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicosFiltrados.map(s => (
            <ServiceCard
              key={s.id}
              servico={s}
              onAgendar={(id) => navigate(`/cliente/agendar?servico=${id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhum serviço encontrado nesta categoria.</p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => setCategoriaSel(null)}>
            Ver todos
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default ClienteServicos;
