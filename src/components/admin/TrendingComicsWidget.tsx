import React from 'react';
import { TrendingComicItem } from '../../types';
import { getImageUrl } from '../../services/apiClient';

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
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Truyện Trending</h3>
          <p className="text-xs text-slate-500">Bảng xếp hạng lượt đọc theo khoảng thời gian</p>
        </div>
        <div className="inline-flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          {(['DAY', 'WEEK', 'MONTH'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                period === p
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === 'DAY' ? 'Hôm nay' : p === 'WEEK' ? 'Tuần này' : 'Tháng này'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Đang tải dữ liệu trending...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">Chưa có dữ liệu lượt đọc trong khoảng thời gian này.</div>
      ) : (
        <div className="divide-y divide-slate-100 mt-2">
          {items.map((item, idx) => (
            <div key={item.comicId} className="py-3 flex items-center gap-4 hover:bg-slate-50/80 px-2 rounded-lg transition-colors">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  idx === 0
                    ? 'bg-amber-400 text-amber-950 shadow-sm'
                    : idx === 1
                    ? 'bg-slate-300 text-slate-800'
                    : idx === 2
                    ? 'bg-amber-700 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {idx + 1}
              </span>

              <img
                src={getImageUrl(item.coverImage) || 'https://via.placeholder.com/80x120?text=No+Cover'}
                alt={item.title}
                className="w-10 h-14 object-cover rounded-md border border-slate-200 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-800 text-sm truncate">{item.title}</h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">{item.author || 'Chưa cập nhật tác giả'}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span>★ {item.avgRating.toFixed(1)}</span>
                  <span>•</span>
                  <span>Tổng {item.totalViewCount.toLocaleString()} lượt đọc</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                  +{item.readCountInPeriod.toLocaleString()} lượt đọc
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
