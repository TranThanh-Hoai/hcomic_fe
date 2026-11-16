import React from 'react';
import { Link } from 'react-router-dom';
import type { GenreResponse } from '../types';

interface GenreBadgeProps {
  genre: GenreResponse | { name: string; slug: string; description?: string };
  size?: 'xs' | 'sm' | 'md';
  clickable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  targetUrl?: string;
}

export const GenreBadge: React.FC<GenreBadgeProps> = ({
  genre,
  size = 'sm',
  clickable = true,
  selected = false,
  onClick,
  className = '',
  targetUrl,
}) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
  }[size];

  const baseClasses = `inline-flex items-center font-medium rounded-lg transition-all duration-200 shrink-0 ${sizeClasses} ${className}`;

  const stateClasses = selected
    ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/25 border border-orange-400'
    : 'bg-[#141721] text-zinc-300 border border-white/5 hover:border-orange-500/40 hover:text-orange-400 hover:bg-[#1a1f2e]';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} ${stateClasses} cursor-pointer`}
        title={genre.description || genre.name}
      >
        {genre.name}
      </button>
    );
  }

  if (clickable) {
    return (
      <Link
        to={targetUrl || `/search?genre=${genre.slug}`}
        className={`${baseClasses} ${stateClasses}`}
        title={genre.description || genre.name}
      >
        {genre.name}
      </Link>
    );
  }

  return (
    <span className={`${baseClasses} ${stateClasses}`} title={genre.description || genre.name}>
      {genre.name}
    </span>
  );
};
