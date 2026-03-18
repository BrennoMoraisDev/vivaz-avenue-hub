import { motion } from 'framer-motion';
import { Star, Gift, Scissors, Trophy } from 'lucide-react';
import { useFidelidade } from '@/hooks/useFidelidade';

export function CartaoFidelidade() {
  const { resumo, loading } = useFidelidade();

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="skeleton-pulse h-5 w-32 rounded" />
        <div className="skeleton-pulse h-3 w-full rounded" />
        <div className="skeleton-pulse h-8 w-24 rounded" />
      </div>
    );
  }

  const cortesNaCicloAtual = resumo.pontos_disponiveis % resumo.meta_proximo_resgate;
  const podeResgatar = resumo.pontos_disponiveis >= resumo.meta_proximo_resgate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, hsl(43 65% 52% / 0.15) 0%, hsl(43 65% 30% / 0.08) 100%)',
        border: '1px solid hsl(43 65% 52% / 0.25)',
      }}
    >
      {/* Decoração de fundo */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5" />
      <div className="absolute -right-2 -bottom-8 h-32 w-32 rounded-full bg-primary/5" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <Star size={16} className="text-primary fill-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">Fidelidade Vivaz</p>
              <p className="text-[10px] text-muted-foreground">{resumo.total_cortes} corte{resumo.total_cortes !== 1 ? 's' : ''} no total</p>
            </div>
          </div>
          {podeResgatar && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-1 text-[10px] font-bold text-primary"
            >
              <Gift size={11} />
              Resgate disponível!
            </motion.div>
          )}
        </div>

        {/* Pontos */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="font-heading text-3xl font-bold text-primary">
              {cortesNaCicloAtual}
            </span>
            <span className="text-sm text-muted-foreground">/ {resumo.meta_proximo_resgate} cortes</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {podeResgatar
              ? 'Você tem um corte grátis disponível!'
              : `Faltam ${resumo.meta_proximo_resgate - cortesNaCicloAtual} corte${resumo.meta_proximo_resgate - cortesNaCicloAtual !== 1 ? 's' : ''} para o próximo brinde`
            }
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="mb-4">
          <div className="h-2 w-full rounded-full bg-primary/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(cortesNaCicloAtual / resumo.meta_proximo_resgate) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
            />
          </div>
        </div>

        {/* Ícones de cortes */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {Array.from({ length: resumo.meta_proximo_resgate }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                i < cortesNaCicloAtual
                  ? 'bg-primary/20 text-primary'
                  : i === cortesNaCicloAtual && podeResgatar
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground/30'
              }`}
            >
              {i === resumo.meta_proximo_resgate - 1 ? (
                <Trophy size={13} />
              ) : (
                <Scissors size={11} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
