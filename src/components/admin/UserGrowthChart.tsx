import React from 'react';
import type { UserGrowthDataPoint } from '../../types';
import { TrendingUp } from 'lucide-react';

interface Props {
  data: UserGrowthDataPoint[];
  loading: boolean;
}

export const UserGrowthChart: React.FC<Props> = ({ data, loading }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-[#141721] rounded-2xl border border-white/5 p-5 shadow-xl text-left">
      <div className="mb-4">
        <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Tăng Trưởng Người Dùng</span>
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">Số lượng tài khoản đăng ký mới 30 ngày gần đây</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-zinc-500 text-xs">Đang tải biểu đồ tăng trưởng...</div>
      ) : data.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-xs">Chưa có dữ liệu tăng trưởng.</div>
      ) : (
        <div className="space-y-2 mt-4">
          <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 px-1 border-b border-white/5 overflow-x-auto">
            {data.map((point) => {
              const heightPercent = Math.max((point.count / maxCount) * 100, 6);

              return (
                <div key={point.date} className="flex-1 min-w-[14px] flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 hidden group-hover:flex bg-[#090a0f] border border-white/10 text-white text-[10px] py-1 px-2 rounded-lg font-bold whitespace-nowrap shadow-xl z-10">
                    {point.date}: {point.count} user
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 rounded-t-md transition-all shadow-sm"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-zinc-500 px-1 pt-1 font-semibold">
            <span>{data[0]?.date}</span>
            <span>{data[Math.floor(data.length / 2)]?.date}</span>
            <span>{data[data.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  );
};
