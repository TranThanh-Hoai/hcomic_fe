import React, { useState } from 'react';
import type { ReportReason, ReportType } from '../types';
import { reportService } from '../services/reportService';
import { ShieldAlert, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
      setSuccessMsg('Báo cáo của bạn đã được gửi thành công. Ban quản trị sẽ rà soát sớm nhất!');
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

  const getTypeName = () => {
    switch (reportType) {
      case 'COMIC':
        return 'Truyện';
      case 'CHAPTER':
        return 'Chapter';
      case 'COMMENT':
        return 'Bình luận';
      default:
        return 'Nội dung';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-[#141721] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10 space-y-4">
        
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-950/50 border border-red-500/30 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Báo cáo vi phạm</h3>
              <p className="text-[11px] text-zinc-400">
                Đối tượng: <span className="font-semibold text-zinc-200">{getTypeName()} {targetTitle ? `"${targetTitle}"` : `#${targetId}`}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/40 text-emerald-300 text-xs rounded-xl border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-950/40 text-red-300 text-xs rounded-xl border border-red-500/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Lý do báo cáo
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full text-xs rounded-xl border border-white/10 p-2.5 bg-[#090a0f] text-white focus:border-orange-500/50 outline-none"
              >
                <option value="SPAM">Spam / Đăng nội dung rác</option>
                <option value="INAPPROPRIATE_CONTENT">Nội dung thô tục, xúc phạm, đồi trụy</option>
                <option value="SPOILER">Spoiler nội dung mà không gán cảnh báo</option>
                <option value="COPYRIGHT">Vi phạm bản quyền / dịch trái phép</option>
                <option value="HARASSMENT">Quấy rối, đe dọa thành viên khác</option>
                <option value="OTHER">Lý do khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Mô tả chi tiết vi phạm
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả cụ thể thông tin vi phạm để ban quản trị đối soát..."
                className="w-full text-xs rounded-xl border border-white/10 p-3 bg-[#090a0f] text-white outline-none focus:border-orange-500/50 placeholder-zinc-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-[#090a0f] hover:bg-white/5 rounded-xl border border-white/5 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <span>Gửi Báo Cáo</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
