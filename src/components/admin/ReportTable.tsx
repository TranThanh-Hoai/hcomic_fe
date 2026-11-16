import React, { useState } from 'react';
import type { ReportAction, ReportItem } from '../../types';
import { ShieldCheck, X, Loader2 } from 'lucide-react';

interface Props {
  reports: ReportItem[];
  loading: boolean;
  onResolve: (id: number, action: ReportAction, note?: string) => Promise<void>;
}

export const ReportTable: React.FC<Props> = ({ reports, loading, onResolve }) => {
  const [activeReport, setActiveReport] = useState<ReportItem | null>(null);
  const [selectedAction, setSelectedAction] = useState<ReportAction>('DELETE_CONTENT');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <div className="py-12 text-center text-zinc-500 text-xs">Đang tải danh sách báo cáo...</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="bg-[#141721] rounded-2xl border border-white/5 p-12 text-center text-zinc-400">
        <ShieldCheck className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
        <p className="font-bold text-white text-base">Không có báo cáo vi phạm nào!</p>
        <p className="text-xs text-zinc-500 mt-1">Hệ thống đang hoạt động an toàn và trong sạch.</p>
      </div>
    );
  }

  const handleConfirmResolve = async () => {
    if (!activeReport) return;
    try {
      setSubmitting(true);
      await onResolve(activeReport.id, selectedAction, note.trim());
      setActiveReport(null);
      setNote('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <div className="overflow-x-auto rounded-2xl border border-white/5 shadow-xl bg-[#141721]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#090a0f] border-b border-white/5 text-zinc-400 uppercase tracking-wider font-bold">
              <th className="py-3.5 px-4">Loại & Mục Vi Phạm</th>
              <th className="py-3.5 px-4">Người Báo Cáo</th>
              <th className="py-3.5 px-4">Lý Do</th>
              <th className="py-3.5 px-4">Mô Tả Chi Tiết</th>
              <th className="py-3.5 px-4">Trạng Thái</th>
              <th className="py-3.5 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-bold text-orange-400 block">{report.reportType}</span>
                  <span className="text-zinc-200 text-xs truncate max-w-[200px] block font-semibold" title={report.targetTitle}>
                    {report.targetTitle || `ID #${report.targetId}`}
                  </span>
                </td>
                <td className="py-3 px-4 text-zinc-400">@{report.reporterUsername}</td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30">
                    {report.reason}
                  </span>
                </td>
                <td className="py-3 px-4 text-zinc-400 max-w-[250px] truncate" title={report.description}>
                  {report.description || 'Không có mô tả thêm'}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      report.status === 'PENDING'
                        ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                        : report.status === 'RESOLVED'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-white/10'
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {report.status === 'PENDING' ? (
                    <button
                      onClick={() => setActiveReport(report)}
                      className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg shadow-sm shadow-orange-500/20 transition-colors cursor-pointer"
                    >
                      Xử lý
                    </button>
                  ) : (
                    <span className="text-[10px] text-zinc-500">
                      Bởi @{report.handledByUsername || 'Admin'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resolve Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-[#141721] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Xử lý báo cáo #{activeReport.id}</h3>
                <p className="text-[11px] text-zinc-400">
                  Mục vi phạm: <span className="font-semibold text-zinc-200">{activeReport.targetTitle}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1.5">Chọn hành động xử lý</label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value as ReportAction)}
                  className="w-full text-xs rounded-xl border border-white/10 p-2.5 bg-[#090a0f] text-white focus:border-orange-500/50 outline-none cursor-pointer"
                >
                  <option value="DELETE_CONTENT">Xóa nội dung vi phạm (Delete Content)</option>
                  <option value="BAN_USER">Xóa nội dung & Khóa tài khoản (Ban User)</option>
                  <option value="WARN_USER">Cảnh cáo người dùng (Warn User)</option>
                  <option value="DISMISS">Bỏ qua báo cáo (Dismiss - Không vi phạm)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1.5">Ghi chú xử lý (Tùy chọn)</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú kết quả xử lý cho lưu trữ audit..."
                  className="w-full text-xs rounded-xl border border-white/10 p-3 bg-[#090a0f] text-white outline-none focus:border-orange-500/50 placeholder-zinc-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-[#090a0f] hover:bg-white/5 rounded-xl border border-white/5 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmResolve}
                  className="px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>Xác nhận Xử lý</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
