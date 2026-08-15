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
    md: 'px-3.5 py-1.5 text-sm',
  }[size];

  const baseClasses = `inline-flex items-center font-medium rounded-lg transition-all duration-200 shrink-0 ${sizeClasses} ${className}`;

  const stateClasses = selected
    ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-200 hover:bg-indigo-700'
    : 'bg-indigo-50/80 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 hover:text-indigo-800';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} ${stateClasses}`}
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
