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
        return { label: 'Quản trị viên (ADMIN)', style: 'bg-red-950/60 text-red-400 border-red-500/30' };
      case 'TRANSLATOR':
        return { label: 'Dịch giả (TRANSLATOR)', style: 'bg-amber-950/60 text-amber-400 border-amber-500/30' };
      default:
        return { label: 'Độc giả (USER)', style: 'bg-zinc-800 text-zinc-300 border-white/10' };
    }
  };

  const roleInfo = getRoleLabel();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in text-left">
      <div className="bg-[#141721] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/10 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-base font-bold text-white tracking-tight">Thông Tin Cá Nhân</h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#090a0f] border border-white/5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 shadow-md shadow-orange-500/20 shrink-0">
            {user.avatar ? (
              <img src={getImageUrl(user.avatar)} alt={user.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#141721] rounded-full flex items-center justify-center text-orange-400 font-extrabold text-xl">
                {(user.displayName || user.username)[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="font-bold text-white text-base truncate">
              {user.displayName || user.username}
            </h4>
            <p className="text-xs text-zinc-400 font-medium truncate">
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
          <div className="space-y-1.5 p-3 rounded-xl bg-[#090a0f] border border-white/5">
            <label className="text-zinc-400 font-semibold flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-orange-400" /> Tên Hiển Thị (Display Name)
            </label>
            {isEditing ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#141721] border border-white/10 rounded-xl focus:border-orange-500/50 text-white text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleSave}
                  className="p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-white text-sm">
                  {user.displayName || user.username}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" /> Đổi
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#090a0f] border border-white/5">
            <span className="text-zinc-400 font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" /> Email
            </span>
            <p className="font-bold text-white pt-1">
              {user.email || 'Chưa cập nhật'}
            </p>
          </div>

          {/* Role */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#090a0f] border border-white/5">
            <span className="text-zinc-400 font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-red-400" /> Vai Trò Hệ Thống
            </span>
            <p className="font-bold text-white pt-1">
              {roleInfo.label}
            </p>
          </div>

        </div>

        <div className="pt-2 border-t border-white/5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#090a0f] hover:bg-white/5 text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
