import React, { useState } from 'react';
import { AdminUserItem } from '../../types';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Khóa tài khoản người dùng</h3>
        <p className="text-xs text-slate-500 mb-4">
          Bạn đang khóa tài khoản <span className="font-semibold text-slate-800">@{user.username}</span>. Nguời dùng này sẽ không thể đăng nhập hoặc thực hiện thao tác.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Lý do khóa tài khoản <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chi tiết (ví dụ: Vi phạm quy định bình luận, đăng truyện lậu...)"
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Đang khóa...' : 'Xác nhận Khóa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
