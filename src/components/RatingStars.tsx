'use client';

import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0 to 5
  maxRating?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  readonly?: boolean;
}

const SIZE_MAP = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export default function RatingStars({
  rating,
  maxRating = 5,
  interactive = false,
  onRatingChange,
  size = 'md',
  className = '',
  readonly = true,
}: RatingStarsProps) {
  const sizeClass = SIZE_MAP[size];

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= maxRating; i++) {
      const isFull = i <= fullStars;
      const isHalf = !isFull && i === fullStars + 1 && hasHalfStar;

      stars.push(
        <span
          key={i}
          className={`${
            interactive ? 'cursor-pointer hover:scale-110' : ''
          } transition-all duration-200`}
          onClick={() => interactive && onRatingChange?.(i)}
        >
          {isFull ? (
            <Star className={`${sizeClass} fill-brand-orange text-brand-orange`} />
          ) : isHalf ? (
            <div className="relative">
              <Star className={`${sizeClass} text-white/20`} />
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star className={`${sizeClass} fill-brand-orange text-brand-orange`} />
              </div>
            </div>
          ) : (
            <Star className={`${sizeClass} text-white/20`} />
          )}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {renderStars()}
    </div>
  );
}
