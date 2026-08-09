import React, { useState } from 'react';
import type { User } from '../types';
import { X, User as UserIcon, Mail, Shield, Check, Edit2 } from 'lucide-react';
import { getImageUrl } from '../services/apiClient';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateDisplayName?: (newDisplayName: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateDisplayName,
}) => {
  const [displayName, setDisplayName] = useState(user.displayName || user.username);
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (displayName.trim() && onUpdateDisplayName) {
      onUpdateDisplayName(displayName.trim());
    }
    setIsEditing(false);
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'ADMIN':
        return { label: 'Quản trị viên (ADMIN)', style: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'TRANSLATOR':
        return { label: 'Dịch giả (TRANSLATOR)', style: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'Độc giả (USER)', style: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
    }
  };

  const roleInfo = getRoleLabel();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800">Thông Tin Cá Nhân</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-teal-50 to-emerald-50 border border-slate-200/80">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-400 p-0.5 shadow-md shadow-indigo-100 shrink-0">
            {user.avatar ? (
              <img src={getImageUrl(user.avatar)} alt={user.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-indigo-600 font-extrabold text-xl">
                {(user.displayName || user.username)[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="font-bold text-slate-800 text-base truncate">
              {user.displayName || user.username}
            </h4>
            <p className="text-xs text-slate-500 font-medium truncate">
              @{user.username}
            </p>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.style}`}>
              {roleInfo.label}
            </span>
          </div>
        </div>

        {/* Detail Fields */}
        <div className="space-y-4 text-xs">
          
          {/* Display Name Edit */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-indigo-500" /> Tên Hiển Thị (Display Name)
            </label>
            {isEditing ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 text-xs"
                />
                <button
                  onClick={handleSave}
                  className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  title="Lưu"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>{user.displayName || user.username}</span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold text-[11px]"
                >
                  <Edit2 className="w-3 h-3" /> Chỉnh sửa
                </button>
              </div>
            )}
          </div>

          {/* Username */}
          <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" /> Tên Đăng Nhập
            </span>
            <p className="font-bold text-slate-700">@{user.username}</p>
          </div>

          {/* Email */}
          <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-teal-500" /> Email Hòm Thư
            </span>
            <p className="font-bold text-slate-700">{user.email || 'Chưa cập nhật'}</p>
          </div>

          {/* Role */}
          <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-500" /> Quyền Hạn
            </span>
            <p className="font-bold text-slate-700">{user.role}</p>
          </div>

        </div>

        {/* Footer Button */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
