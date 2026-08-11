import React from 'react';
import type { UserGrowthDataPoint } from '../../types';

interface Props {
  data: UserGrowthDataPoint[];
  loading: boolean;
}

export const UserGrowthChart: React.FC<Props> = ({ data, loading }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-slate-800 text-lg">Tăng Trưởng Người Dùng</h3>
        <p className="text-xs text-slate-500">Số lượng tài khoản đăng ký mới 30 ngày gần đây</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Đang tải biểu đồ tăng trưởng...</div>
      ) : data.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">Chưa có dữ liệu tăng trưởng.</div>
      ) : (
        <div className="space-y-2 mt-4">
          <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 px-1 border-b border-slate-200 overflow-x-auto">
            {data.map((point) => {
              const heightPercent = Math.max((point.count / maxCount) * 100, 6);

              return (
                <div key={point.date} className="flex-1 min-w-[14px] flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 hidden group-hover:flex bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-medium whitespace-nowrap shadow-lg z-10">
                    {point.date}: {point.count} user
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 hover:from-indigo-600 hover:to-indigo-500 rounded-t transition-all"
                  ></div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 px-1 pt-1 font-medium">
            <span>{data[0]?.date}</span>
            <span>{data[Math.floor(data.length / 2)]?.date}</span>
            <span>{data[data.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  );
};
