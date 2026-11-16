import React, { useEffect, useState } from 'react';
import { adminReportService } from '../services/adminReportService';
import type { ReportAction, ReportItem, ReportStatus, ReportType } from '../types';
import { ReportTable } from '../components/admin/ReportTable';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReportStatus>('PENDING');
  const [typeFilter, setTypeFilter] = useState<ReportType | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchReports();
  }, [statusFilter, typeFilter, page]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await adminReportService.getReports({
        status: statusFilter,
        type: (typeFilter as ReportType) || undefined,
        page,
        size: 15,
      });
      setReports(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (id: number, action: ReportAction, note?: string) => {
    await adminReportService.resolveReport(id, { action, resolutionNote: note });
    fetchReports();
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Xử Lý Báo Cáo Vi Phạm
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Tiếp nhận và giải quyết phản ánh từ người dùng về bình luận, chapter và truyện vi phạm
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#141721] rounded-2xl border border-white/5 p-4 shadow-xl flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {(['PENDING', 'RESOLVED', 'DISMISSED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(0);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-[#090a0f] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {st === 'PENDING' ? 'Chờ xử lý' : st === 'RESOLVED' ? 'Đã giải quyết' : 'Đã bỏ qua'}
            </button>
          ))}
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setPage(0);
            }}
            className="text-xs rounded-xl border border-white/10 p-2.5 bg-[#090a0f] text-white outline-none focus:border-orange-500/50 cursor-pointer"
          >
            <option value="">Tất cả loại vi phạm</option>
            <option value="COMMENT">Bình luận (Comment)</option>
            <option value="CHAPTER">Chapter</option>
            <option value="COMIC">Truyện (Comic)</option>
          </select>
        </div>
      </div>

      <ReportTable reports={reports} loading={loading} onResolve={handleResolveReport} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-[#141721] border border-white/10 rounded-xl hover:bg-white/5 disabled:opacity-40 cursor-pointer"
          >
            Trang trước
          </button>
          <span className="text-xs font-bold text-zinc-400">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-[#141721] border border-white/10 rounded-xl hover:bg-white/5 disabled:opacity-40 cursor-pointer"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};
