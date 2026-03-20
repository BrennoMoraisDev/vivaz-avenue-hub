import { Clock } from 'lucide-react';

interface TimeSlotPickerProps {
  slots: string[];
  selected: string | null;
  onSelect: (slot: string) => void;
}

const TimeSlotPicker = ({ slots, selected, onSelect }: TimeSlotPickerProps) => {
  if (slots.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <Clock size={32} className="mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Nenhum horário disponível para esta data.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelect(slot)}
          className={`rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
            selected === slot
              ? 'bg-primary text-primary-foreground shadow-gold'
              : 'glass text-foreground hover:bg-primary/10 hover:text-primary'
          }`}
        >
          {slot}
        </button>
      ))}
    </div>
  );
};

export default TimeSlotPicker;
