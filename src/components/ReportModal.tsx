import React, { useState } from 'react';
import { ReportReason, ReportType } from '../types';
import { reportService } from '../services/reportService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  targetId: number;
  targetTitle?: string;
}

export const ReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  reportType,
  targetId,
  targetTitle,
}) => {
  const [reason, setReason] = useState<ReportReason>('SPAM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg('');
      await reportService.createReport({
        reportType,
        targetId,
        reason,
        description: description.trim(),
      });
      setSuccessMsg('Báo cáo của bạn đã được gửi thành công. Cảm ơn sự đóng góp của bạn!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi báo cáo. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Báo cáo vi phạm</h3>
        <p className="text-xs text-slate-500 mb-4">
          Báo cáo {reportType === 'COMMENT' ? 'Bình luận' : reportType === 'CHAPTER' ? 'Chapter' : 'Truyện'}:{' '}
          <span className="font-semibold text-slate-800">{targetTitle || `#${targetId}`}</span>
        </p>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lý do báo cáo</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="SPAM">Spam / Rác</option>
                <option value="INAPPROPRIATE_CONTENT">Nội dung thô tục, xúc phạm, đồi dụy</option>
                <option value="SPOILER">Spoiler nội dung truyện không gán tag</option>
                <option value="COPYRIGHT">Vi phạm bản quyền / đăng lậu</option>
                <option value="HARASSMENT">Quấy rối, đe dọa người dùng khác</option>
                <option value="OTHER">Lý do khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Chi tiết vi phạm</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả cụ thể thông tin vi phạm để ban quản trị đối soát..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Gửi Báo Cáo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
