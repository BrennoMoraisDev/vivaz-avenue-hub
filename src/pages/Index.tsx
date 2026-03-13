import heroBg from '@/assets/hero-bg.jpg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getRoleHome } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { CalendarDays, Scissors, Star, Clock, Crown, Phone, MapPin, Instagram, MessageCircle } from 'lucide-react';

const mockServices = [
  { name: 'Corte Premium', price: 'R$ 60', duration: '45 min', desc: 'Corte moderno com acabamento perfeito' },
  { name: 'Barba Completa', price: 'R$ 45', duration: '30 min', desc: 'Barba modelada com toalha quente' },
  { name: 'Combo VIP', price: 'R$ 90', duration: '1h15', desc: 'Corte + barba + hidratação capilar' },
];

const mockBarbers = [
  { name: 'Rafael Silva', specialty: 'Cortes Degradê', initials: 'RS' },
  { name: 'Lucas Mendes', specialty: 'Barba & Bigode', initials: 'LM' },
  { name: 'André Costa', specialty: 'Cortes Clássicos', initials: 'AC' },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleCTA = () => {
    if (user && profile) {
      navigate(getRoleHome(profile.role));
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-10 bg-primary/50" />
            <span className="font-body text-[11px] uppercase tracking-[0.4em] text-primary/80">Tradição • Estilo • Cuidado</span>
            <div className="h-px w-10 bg-primary/50" />
          </div>

          <h1 className="font-heading text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient-gold">VIVAZ</span>
            <br />
            <span className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-light tracking-wider">BARBEARIA AVENUE</span>
          </h1>

          <p className="max-w-lg text-base text-muted-foreground sm:text-lg leading-relaxed">
            Onde estilo e tecnologia se encontram. Experiência exclusiva em cortes masculinos e tratamentos premium.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row mt-2">
            <Button variant="gold" size="xl" onClick={handleCTA}>
              <CalendarDays size={18} />
              Agendar agora
            </Button>
            <Button variant="gold-outline" size="xl" onClick={() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' })}>
              Conhecer serviços
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-8 w-5 rounded-full border-2 border-primary/30 p-1">
            <div className="h-2 w-1.5 rounded-full bg-primary/50 mx-auto" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border/50">
        <div className="container">
          <div className="mb-14 text-center">
            <span className="font-body text-[11px] uppercase tracking-[0.4em] text-primary/70">Por que nos escolher</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Uma Experiência <span className="text-gradient-gold">Única</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Scissors, title: 'Cortes Premium', desc: 'Técnicas modernas e clássicas com acabamento impecável' },
              { icon: Crown, title: 'Ambiente Exclusivo', desc: 'Espaço sofisticado pensado para seu conforto' },
              { icon: Star, title: 'Profissionais Top', desc: 'Barbeiros experientes e atualizados' },
              { icon: Clock, title: 'Agendamento Fácil', desc: 'Marque seu horário em segundos pelo app' },
            ].map((item) => (
              <div key={item.title} className="group glass rounded-2xl p-8 transition-all duration-300 hover:shadow-gold">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <item.icon size={22} className="text-primary" />
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicos" className="py-20 border-t border-border/50">
        <div className="container">
          <div className="mb-14 text-center">
            <span className="font-body text-[11px] uppercase tracking-[0.4em] text-primary/70">Nossos serviços</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Serviços em <span className="text-gradient-gold">Destaque</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {mockServices.map((service) => (
              <div key={service.name} className="glass rounded-2xl p-8 transition-all duration-300 hover:shadow-gold group">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-heading text-lg font-semibold text-foreground">{service.name}</h3>
                  <span className="font-heading text-lg font-bold text-primary">{service.price}</span>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">{service.desc}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={12} />
                  <span>{service.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Barbers */}
      <section className="py-20 border-t border-border/50">
        <div className="container">
          <div className="mb-14 text-center">
            <span className="font-body text-[11px] uppercase tracking-[0.4em] text-primary/70">Nossa equipe</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Barbeiros <span className="text-gradient-gold">Especialistas</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {mockBarbers.map((barber) => (
              <div key={barber.name} className="glass rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-gold">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  {barber.initials}
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">{barber.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{barber.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border/50 py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="container relative text-center">
          <Crown size={36} className="mx-auto mb-4 text-primary" />
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Pronto para o <span className="text-gradient-gold">Melhor</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Agende agora e descubra por que somos a barbearia mais requisitada da região.
          </p>
          <Button variant="gold" size="xl" className="mt-8" onClick={handleCTA}>
            Agendar Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="font-heading text-lg font-bold text-gradient-gold mb-3">VIVAZ</h3>
              <p className="text-sm text-muted-foreground">Barbearia Avenue<br />Tradição • Estilo • Cuidado</p>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-foreground mb-3">Contato</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Phone size={14} className="text-primary" /> (00) 00000-0000</div>
                <div className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> Endereço da barbearia</div>
              </div>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-foreground mb-3">Redes sociais</h4>
              <div className="flex gap-3">
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary">
                  <Instagram size={18} />
                </a>
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary">
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
            © 2026 Vivaz Barbearia Avenue. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
