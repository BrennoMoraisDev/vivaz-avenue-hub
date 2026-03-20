import { Scissors, User, Calendar, Clock, Check } from 'lucide-react';

const steps = [
  { icon: Scissors, label: 'Serviço' },
  { icon: User, label: 'Barbeiro' },
  { icon: Calendar, label: 'Data' },
  { icon: Clock, label: 'Horário' },
  { icon: Check, label: 'Confirmar' },
];

interface StepIndicatorProps {
  current: number; // 0-indexed
}

const StepIndicator = ({ current }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1 sm:gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                i < current
                  ? 'border-primary bg-primary text-primary-foreground'
                  : i === current
                  ? 'border-primary bg-primary/10 text-primary animate-pulse-gold'
                  : 'border-border bg-secondary text-muted-foreground'
              }`}
            >
              {i < current ? <Check size={14} /> : <step.icon size={14} />}
            </div>
            <span className={`text-[9px] font-medium ${
              i <= current ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-4 sm:w-8 mb-4 transition-colors ${
              i < current ? 'bg-primary' : 'bg-border'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
