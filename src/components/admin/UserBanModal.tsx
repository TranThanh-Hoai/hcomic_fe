import React, { useState } from 'react';
import type { AdminUserItem } from '../../types';
import { X, ShieldAlert, Loader2 } from 'lucide-react';

interface Props {
  user: AdminUserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBan: (userId: number, reason: string) => Promise<void>;
}

export const UserBanModal: React.FC<Props> = ({ user, isOpen, onClose, onConfirmBan }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do khóa tài khoản');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onConfirmBan(user.userId, reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi khóa tài khoản');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in text-left">
      <div className="bg-[#141721] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10 space-y-4">
        
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-950/50 border border-red-500/30 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Khóa tài khoản</h3>
              <p className="text-[11px] text-zinc-400">
                Tài khoản: <span className="font-semibold text-zinc-200">@{user.username}</span>
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

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Lý do khóa tài khoản <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chi tiết (ví dụ: Vi phạm quy định bình luận, spam...)"
              className="w-full text-xs rounded-xl border border-white/10 p-3 bg-[#090a0f] text-white focus:border-red-500/50 outline-none placeholder-zinc-600 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-[#090a0f] hover:bg-white/5 rounded-xl border border-white/5 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang khóa...</span>
                </>
              ) : (
                <span>Xác nhận Khóa</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
