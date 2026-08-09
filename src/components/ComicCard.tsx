import React from 'react';
import { Link } from 'react-router-dom';
import type { ComicResponse } from '../types';
import { getImageUrl } from '../services/apiClient';
import { StatusBadge } from './StatusBadge';
import { RatingStars } from './RatingStars';
import { Eye, Heart, User, BookOpen } from 'lucide-react';

interface ComicCardProps {
  comic: ComicResponse;
}

export const ComicCard: React.FC<ComicCardProps> = ({ comic }) => {
  return (
    <Link
      to={`/comic/${comic.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 soft-shadow soft-shadow-hover flex flex-col h-full"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <img
          src={getImageUrl(comic.coverImage)}
          alt={comic.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop';
          }}
        />

        {/* Status Badge overlay */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <StatusBadge status={comic.status} />
        </div>

        {/* Floating gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="text-xs font-medium text-white flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Xem chi tiết
          </span>
        </div>
      </div>

      {/* Comic Info Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {comic.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            {comic.author || comic.uploader || 'Chưa cập nhật'}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <RatingStars rating={comic.rating} size={14} />

          <div className="flex items-center gap-2.5 font-medium text-[11px]">
            <span className="flex items-center gap-1 text-slate-500">
              <Eye className="w-3 h-3 text-slate-400" />
              {comic.viewCount?.toLocaleString() || 0}
            </span>
            <span className="flex items-center gap-1 text-rose-500 font-semibold">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
              {comic.likeCount || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
