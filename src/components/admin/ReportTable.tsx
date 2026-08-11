import React, { useState } from 'react';
import { ReportAction, ReportItem } from '../../types';

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
    return <div className="py-12 text-center text-slate-400 text-sm">Đang tải danh sách báo cáo...</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        <svg className="w-12 h-12 mx-auto text-emerald-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-semibold text-slate-700">Không có báo cáo vi phạm nào!</p>
        <p className="text-xs text-slate-400 mt-1">Hệ thống đang hoạt động an toàn và trong sạch.</p>
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
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Loại & Mục Vi Phạm</th>
              <th className="py-3 px-4">Người Báo Cáo</th>
              <th className="py-3 px-4">Lý Do</th>
              <th className="py-3 px-4">Mô Tả Chi Tiết</th>
              <th className="py-3 px-4">Trạng Thái</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-bold text-indigo-700 block">{report.reportType}</span>
                  <span className="text-slate-800 text-xs truncate max-w-[200px] block" title={report.targetTitle}>
                    {report.targetTitle || `ID #${report.targetId}`}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">@{report.reporterUsername}</td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    {report.reason}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500 max-w-[250px] truncate" title={report.description}>
                  {report.description || 'Không có mô tả thêm'}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      report.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700'
                        : report.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {report.status === 'PENDING' ? (
                    <button
                      onClick={() => setActiveReport(report)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-md shadow-sm transition-colors"
                    >
                      Xử lý
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Xử lý báo cáo vi phạm #{activeReport.id}</h3>
            <p className="text-xs text-slate-500 mb-4">
              Mục vi phạm: <span className="font-semibold text-slate-800">{activeReport.targetTitle}</span>
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Chọn Hành Động Xử Lý</label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value as ReportAction)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="DELETE_CONTENT">Xóa nội dung vi phạm (Delete Content)</option>
                  <option value="BAN_USER">Xóa nội dung & Khóa tài khoản vi phạm (Ban User)</option>
                  <option value="WARN_USER">Cảnh cáo người dùng (Warn User)</option>
                  <option value="DISMISS">Bỏ qua báo cáo (Dismiss - Không vi phạm)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Ghi chú xử lý (Tùy chọn)</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú kết quả xử lý cho lưu trữ admin..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmResolve}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Đang xử lý...' : 'Xác nhận Xử lý'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
