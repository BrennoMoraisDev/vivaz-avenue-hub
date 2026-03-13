import logo from '@/assets/logo-vivaz.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CalendarDays, Scissors, Star } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center px-4 py-12">
      {/* Hero */}
      <div className="flex flex-col items-center gap-6 text-center animate-fade-in">
        <img src={logo} alt="Vivaz Barbearia Avenue" className="h-40 w-40 object-contain" />
        <h1 className="font-heading text-3xl font-bold text-gradient-gold sm:text-4xl">
          Vivaz Barbearia Avenue
        </h1>
        <p className="max-w-md text-muted-foreground">
          Tradição • Estilo • Cuidado
        </p>

        {user ? (
          <button
            onClick={() => navigate('/agenda')}
            className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-heading font-semibold text-primary-foreground shadow-gold transition-all hover:scale-105 hover:bg-primary/90"
          >
            <CalendarDays size={20} />
            Agendar Horário
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="mt-4 rounded-lg bg-primary px-8 py-3 font-heading font-semibold text-primary-foreground shadow-gold transition-all hover:scale-105 hover:bg-primary/90"
          >
            Entrar
          </button>
        )}
      </div>

      {/* Features */}
      <div className="mt-16 grid w-full max-w-lg gap-4 sm:grid-cols-3">
        {[
          { icon: Scissors, title: 'Serviços Premium', desc: 'Cortes, barba e tratamentos' },
          { icon: CalendarDays, title: 'Agendamento Fácil', desc: 'Marque pelo app em segundos' },
          { icon: Star, title: 'Profissionais Top', desc: 'Barbeiros experientes' },
        ].map((item) => (
          <div key={item.title} className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/50">
            <item.icon size={28} className="text-primary" />
            <h3 className="font-heading text-sm font-semibold text-foreground">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
