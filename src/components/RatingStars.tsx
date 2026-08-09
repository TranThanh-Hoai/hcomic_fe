import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating?: number | null;
  maxStars?: number;
  readOnly?: boolean;
  onRate?: (score: number) => void;
  size?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating = 0,
  maxStars = 5,
  readOnly = true,
  onRate,
  size = 18,
}) => {
  const [hoverScore, setHoverScore] = useState<number | null>(null);

  const displayRating = hoverScore !== null ? hoverScore : (rating || 0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = displayRating >= starValue;
        const isHalf = !isFilled && displayRating >= starValue - 0.5;

        return (
          <button
            key={index}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onRate && onRate(starValue)}
            onMouseEnter={() => !readOnly && setHoverScore(starValue)}
            onMouseLeave={() => !readOnly && setHoverScore(null)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform focus:outline-none`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-slate-100 text-slate-300'
              } transition-colors`}
            />
          </button>
        );
      })}
      {rating !== undefined && rating !== null && (
        <span className="text-xs font-semibold text-slate-600 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};
