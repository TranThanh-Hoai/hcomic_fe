import React, { useState } from 'react';
import { AdminUserItem, UserRole } from '../../types';

interface Props {
  user: AdminUserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRole: (userId: number, role: UserRole) => Promise<void>;
}

export const UserRoleModal: React.FC<Props> = ({ user, isOpen, onClose, onConfirmRole }) => {
  const [role, setRole] = useState<UserRole>('USER');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (user) {
      setRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await onConfirmRole(user.userId, role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật vai trò');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Cập nhật vai trò người dùng</h3>
        <p className="text-xs text-slate-500 mb-4">
          Thay đổi vai trò cho <span className="font-semibold text-slate-800">@{user.username}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Chọn Vai trò</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="USER">USER (Người dùng thông thường)</option>
              <option value="TRANSLATOR">TRANSLATOR (Dịch giả / Uploader)</option>
              <option value="ADMIN">ADMIN (Quản trị viên toàn quyền)</option>
            </select>
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
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Đang lưu...' : 'Lưu vai trò'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
