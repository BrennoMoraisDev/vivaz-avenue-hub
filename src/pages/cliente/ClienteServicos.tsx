import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import ServiceCard from '@/components/cliente/ServiceCard';
import { mockServicos, mockCategorias } from '@/data/mockData';

const ClienteServicos = () => {
  const navigate = useNavigate();
  const [categoriaSel, setCategoriaSel] = useState<string | null>(null);

  const servicosFiltrados = categoriaSel
    ? mockServicos.filter(s => s.ativo && s.categoria_id === categoriaSel)
    : mockServicos.filter(s => s.ativo);

  return (
    <PageContainer title="Serviços" subtitle="Conheça nossos serviços e agende o seu">
      {/* Category tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setCategoriaSel(null)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            !categoriaSel ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground hover:text-foreground'
          }`}
        >
          Todos
        </button>
        {mockCategorias.map(c => (
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

      {/* Services grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {servicosFiltrados.map(s => (
          <ServiceCard
            key={s.id}
            servico={s}
            onAgendar={(id) => navigate(`/cliente/agendar?servico=${id}`)}
          />
        ))}
      </div>

      {servicosFiltrados.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhum serviço encontrado nesta categoria.</p>
        </div>
      )}
    </PageContainer>
  );
};

export default ClienteServicos;
