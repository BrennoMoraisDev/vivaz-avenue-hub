import logo from '@/assets/logo-vivaz.png';
import heroBg from '@/assets/hero-bg.jpg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CalendarDays, Scissors, Star, Clock, Crown, Phone } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
          <div className="animate-fade-in">
            <img src={logo} alt="Vivaz Barbearia Avenue" className="mx-auto h-48 w-48 object-contain drop-shadow-2xl sm:h-56 sm:w-56" />
          </div>

          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-primary/60" />
              <span className="font-body text-xs uppercase tracking-[0.3em] text-primary/80">Tradição • Estilo • Cuidado</span>
              <div className="h-px w-12 bg-primary/60" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
              Barbearia <span className="text-gradient-gold">Premium</span>
            </h1>
            <p className="mx-auto max-w-lg text-base text-muted-foreground sm:text-lg">
              Experiência exclusiva em cortes masculinos, barba e tratamentos capilares com os melhores profissionais.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate(user ? '/agenda' : '/login')}
              className="group flex items-center gap-2 rounded-lg bg-primary px-8 py-4 font-heading text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-gold transition-all hover:scale-105 hover:shadow-[0_0_30px_hsl(43_65%_52%_/_0.3)]"
            >
              <CalendarDays size={18} />
              Agendar Horário
            </button>
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-8 py-4 font-heading text-sm font-bold uppercase tracking-wider text-foreground backdrop-blur transition-all hover:border-primary/50 hover:bg-card"
            >
              <Phone size={18} className="text-primary" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-8 w-5 rounded-full border-2 border-primary/40 p-1">
            <div className="h-2 w-1.5 rounded-full bg-primary/60 mx-auto" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="font-body text-xs uppercase tracking-[0.3em] text-primary">Por que nos escolher</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground">
              Uma Experiência <span className="text-gradient-gold">Única</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Scissors, title: 'Cortes Premium', desc: 'Técnicas modernas e clássicas com acabamento impecável' },
              { icon: Crown, title: 'Ambiente Exclusivo', desc: 'Espaço sofisticado pensado para seu conforto' },
              { icon: Star, title: 'Profissionais Top', desc: 'Barbeiros experientes e constantemente atualizados' },
              { icon: Clock, title: 'Agendamento Fácil', desc: 'Marque seu horário em segundos pelo app' },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-gold"
              >
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 transition-all group-hover:scale-150" />
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-border py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="container relative text-center">
          <Crown size={40} className="mx-auto mb-4 text-primary" />
          <h2 className="font-heading text-3xl font-bold text-foreground">
            Pronto para o <span className="text-gradient-gold">Melhor</span>?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Agende agora e descubra por que somos a barbearia mais requisitada da região.
          </p>
          <button
            onClick={() => navigate(user ? '/agenda' : '/login')}
            className="mt-8 rounded-lg bg-primary px-10 py-4 font-heading text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-gold transition-all hover:scale-105 hover:shadow-[0_0_30px_hsl(43_65%_52%_/_0.3)]"
          >
            Agendar Agora
          </button>
        </div>
      </section>
    </div>
  );
};

export default Index;
