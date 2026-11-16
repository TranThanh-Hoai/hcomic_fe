import React from 'react';
import { Link } from 'react-router-dom';
import type { ComicResponse } from '../types';
import { getImageUrl } from '../services/apiClient';
import { StatusBadge } from './StatusBadge';
import { RatingStars } from './RatingStars';
import { Eye, Heart, BookOpen } from 'lucide-react';

interface ComicCardProps {
  comic: ComicResponse;
}

export const ComicCard: React.FC<ComicCardProps> = ({ comic }) => {
  return (
    <Link
      to={`/comic/${comic.slug}`}
      className="group relative bg-[#141721] rounded-2xl overflow-hidden border border-white/5 hover:border-orange-500/30 transition-all duration-300 flex flex-col h-full soft-shadow hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-500/5"
    >
      {/* 3:4 Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#090a0f]">
        <img
          src={getImageUrl(comic.coverImage)}
          alt={comic.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop';
          }}
        />

        {/* Status Badge overlay */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <StatusBadge status={comic.status} />
        </div>

        {/* Ambient Dark Bottom Vignette */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#141721] via-[#141721]/50 to-transparent pointer-events-none" />

        {/* Hover Quick Read Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3">
          <span className="px-3 py-1.5 rounded-xl bg-orange-500/90 text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-md shadow-lg shadow-orange-500/20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <BookOpen className="w-3.5 h-3.5" /> Đọc ngay
          </span>
        </div>
      </div>

      {/* Comic Info Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-orange-400 transition-colors tracking-tight">
            {comic.title}
          </h3>
          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
            {comic.author || comic.uploader || 'Chưa cập nhật'}
          </p>

          {comic.genres && comic.genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {comic.genres.slice(0, 2).map((g) => (
                <span
                  key={g.id}
                  className="px-1.5 py-0.5 bg-zinc-800/80 border border-white/5 text-zinc-300 rounded text-[9px] font-medium"
                >
                  {g.name}
                </span>
              ))}
              {comic.genres.length > 2 && (
                <span className="text-[9px] text-zinc-500 font-medium">
                  +{comic.genres.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
          <RatingStars rating={comic.rating} size={13} />

          <div className="flex items-center gap-2 font-medium text-[10px]">
            <span className="flex items-center gap-0.5 text-zinc-400">
              <Eye className="w-3 h-3 text-zinc-500" />
              {comic.viewCount?.toLocaleString() || 0}
            </span>
            <span className="flex items-center gap-0.5 text-rose-400 font-semibold">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
              {comic.likeCount || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
