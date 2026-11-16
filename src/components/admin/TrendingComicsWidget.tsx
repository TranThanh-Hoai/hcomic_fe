import React from 'react';
import type { TrendingComicItem } from '../../types';
import { getImageUrl } from '../../services/apiClient';
import { Flame, Star } from 'lucide-react';

interface Props {
  items: TrendingComicItem[];
  period: 'DAY' | 'WEEK' | 'MONTH';
  onPeriodChange: (period: 'DAY' | 'WEEK' | 'MONTH') => void;
  loading: boolean;
}

export const TrendingComicsWidget: React.FC<Props> = ({
  items,
  period,
  onPeriodChange,
  loading,
}) => {
  return (
    <div className="bg-[#141721] rounded-2xl border border-white/5 p-5 shadow-xl text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Truyện Thịnh Hành</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Xếp hạng lượt đọc theo khoảng thời gian</p>
        </div>
        <div className="inline-flex bg-[#090a0f] p-1 rounded-xl border border-white/5 self-start sm:self-auto">
          {(['DAY', 'WEEK', 'MONTH'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                period === p
                  ? 'bg-[#141721] text-orange-400 border border-white/5 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {p === 'DAY' ? 'Hôm nay' : p === 'WEEK' ? 'Tuần này' : 'Tháng này'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-zinc-500 text-xs">Đang tải dữ liệu trending...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-xs">Chưa có dữ liệu lượt đọc trong khoảng thời gian này.</div>
      ) : (
        <div className="divide-y divide-white/5 mt-2">
          {items.map((item, idx) => (
            <div key={item.comicId} className="py-3 flex items-center gap-3.5 hover:bg-white/5 px-2 rounded-xl transition-colors">
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                  idx === 0
                    ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                    : idx === 1
                    ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/30'
                    : idx === 2
                    ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30'
                    : 'bg-[#090a0f] text-zinc-500 border border-white/5'
                }`}
              >
                {idx + 1}
              </span>

              <img
                src={getImageUrl(item.coverImage) || 'https://via.placeholder.com/80x120?text=No+Cover'}
                alt={item.title}
                className="w-10 h-14 object-cover rounded-lg border border-white/5 shrink-0 bg-[#090a0f]"
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-xs sm:text-sm truncate">{item.title}</h4>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{item.author || 'Chưa rõ tác giả'}</p>
                <div className="flex items-center gap-3 text-[10px] text-zinc-400 mt-1">
                  <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {item.avgRating.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{item.totalViewCount.toLocaleString()} views</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[11px] font-bold rounded-lg">
                  +{item.readCountInPeriod.toLocaleString()} lượt
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
