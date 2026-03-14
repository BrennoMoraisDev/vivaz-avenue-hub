import { Star } from 'lucide-react';
import { useState } from 'react';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
}

const RatingStars = ({ value, onChange, readOnly = false, size = 24 }: RatingStarsProps) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`transition-all duration-200 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hover || value)
                ? 'fill-primary text-primary'
                : 'fill-transparent text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
