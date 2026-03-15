import { LucideIcon } from 'lucide-react';

interface GanhosCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export default function GanhosCard({ icon: Icon, label, value }: GanhosCardProps) {
  return (
    <div className="glass rounded-2xl p-5 hover-gold-glow">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Icon size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-heading text-xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
