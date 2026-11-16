import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/apiClient';
import { User as UserIcon, Mail, Shield, Check, Edit2, LogOut, PlusCircle, ArrowLeft, Bookmark } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout, updateUser, hasRole } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.username);
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4 px-4">
        <div className="p-8 bg-[#141721] border border-white/5 rounded-3xl text-zinc-300 space-y-3 soft-shadow">
          <h3 className="text-base font-bold text-white">Vui lòng đăng nhập</h3>
          <p className="text-xs text-zinc-400">Bạn cần đăng nhập để xem trang thông tin cá nhân.</p>
          <div className="pt-2">
            <Link to="/login" className="inline-block px-5 py-2.5 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md">
              → Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveDisplayName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    updateUser({ displayName: displayName.trim() });
    setIsEditing(false);
    setSuccessMsg('Cập nhật tên hiển thị thành công!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const isTranslatorOrAdmin = hasRole(['TRANSLATOR', 'ADMIN']);

  const getRoleBadge = () => {
    switch (user.role) {
      case 'ADMIN':
        return { label: 'Quản trị viên (ADMIN)', style: 'bg-red-950/60 text-red-400 border-red-500/30' };
      case 'TRANSLATOR':
        return { label: 'Dịch giả (TRANSLATOR)', style: 'bg-amber-950/60 text-amber-400 border-amber-500/30' };
      default:
        return { label: 'Độc giả (USER)', style: 'bg-zinc-800 text-zinc-300 border-white/10' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="py-6 max-w-3xl mx-auto space-y-6 animate-fade-in text-left">
      
      {/* Header Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Hồ Sơ Cá Nhân</h1>
      </div>

      {successMsg && (
        <div className="p-3.5 text-xs bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded-2xl font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" /> {successMsg}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-[#141721] rounded-3xl p-6 sm:p-8 border border-white/5 soft-shadow space-y-6">
        
        {/* Banner with Avatar */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-[#090a0f] border border-white/5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 p-1 shadow-lg shadow-orange-500/20 shrink-0">
            {user.avatar ? (
              <img src={getImageUrl(user.avatar)} alt={user.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#141721] rounded-full flex items-center justify-center text-orange-400 font-extrabold text-2xl">
                {(user.displayName || user.username)[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-xl font-extrabold text-white">
              {user.displayName || user.username}
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              @{user.username}
            </p>
            <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleBadge.style}`}>
                <Shield className="w-3.5 h-3.5" /> {roleBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information Fields */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Chi tiết tài khoản
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name Field */}
            <div className="p-4 rounded-2xl bg-[#090a0f] border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-orange-400" /> Tên Hiển Thị
                </span>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" /> Đổi tên
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveDisplayName} className="pt-2 space-y-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#141721] border border-white/10 rounded-xl focus:border-orange-500/50 text-white focus:outline-none"
                    placeholder="Nhập tên mới..."
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-2.5 py-1 text-xs text-zinc-400 hover:bg-white/5 rounded-lg cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs bg-orange-500 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                    >
                      Lưu
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm font-bold text-white pt-1">
                  {user.displayName || user.username}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="p-4 rounded-2xl bg-[#090a0f] border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-amber-400" /> Email Liên Kết
              </span>
              <p className="text-sm font-bold text-white pt-1">
                {user.email || 'Chưa liên kết email'}
              </p>
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              to="/library"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#090a0f] hover:bg-white/5 text-zinc-200 border border-white/10 rounded-xl text-xs font-bold transition-all"
            >
              <Bookmark className="w-4 h-4 text-orange-400" />
              <span>Tủ Sách Cá Nhân</span>
            </Link>

            {isTranslatorOrAdmin && (
              <Link
                to="/my-comics"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Studio Dịch Truyện</span>
              </Link>
            )}
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất</span>
          </button>
        </div>

      </div>
    </div>
  );
};
