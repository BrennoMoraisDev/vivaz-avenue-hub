import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={toggle}
      className={`relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${className}`}
      aria-label="Alternar tema"
      title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.2 }}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </motion.div>
    </motion.button>
  );
}
