import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/apiClient';
import { User as UserIcon, Mail, Shield, Check, Edit2, LogOut, PlusCircle, ArrowLeft } from 'lucide-react';

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
      <div className="py-12 max-w-md mx-auto text-center space-y-4">
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 space-y-2">
          <h3 className="text-base font-bold">Vui lòng đăng nhập</h3>
          <p className="text-xs">Bạn cần đăng nhập để xem trang thông tin cá nhân.</p>
        </div>
        <Link to="/login" className="inline-block text-xs font-bold text-indigo-600 hover:underline">
          → Đăng nhập ngay
        </Link>
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
        return { label: 'Quản trị viên (ADMIN)', style: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'TRANSLATOR':
        return { label: 'Dịch giả (TRANSLATOR)', style: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'Độc giả (USER)', style: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <h1 className="text-xl font-extrabold text-slate-800">Trang Cá Nhân</h1>
      </div>

      {successMsg && (
        <div className="p-3.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" /> {successMsg}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 soft-shadow space-y-6">
        
        {/* Banner with Avatar */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-teal-50 to-emerald-50 border border-slate-200/80">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-400 p-1 shadow-lg shadow-indigo-100 shrink-0">
            {user.avatar ? (
              <img src={getImageUrl(user.avatar)} alt={user.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-indigo-600 font-extrabold text-2xl">
                {(user.displayName || user.username)[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-xl font-extrabold text-slate-800">
              {user.displayName || user.username}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              @{user.username}
            </p>
            <div className="pt-1">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${roleBadge.style}`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Info Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            Chi Tiết Tài Khoản
          </h3>

          {/* Display Name Form */}
          <form onSubmit={handleSaveDisplayName} className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-indigo-500" /> Tên Hiển Thị (Display Name)
              </span>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                </button>
              )}
            </label>

            {isEditing ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user.displayName || user.username);
                  }}
                  className="px-3 py-2 text-slate-500 hover:bg-slate-200 rounded-xl text-xs font-medium"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <p className="text-sm font-bold text-slate-800 pt-0.5">
                {user.displayName || user.username}
              </p>
            )}
          </form>

          {/* Username */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-slate-400" /> Tên Đăng Nhập (Username)
            </span>
            <p className="text-sm font-bold text-slate-800">@{user.username}</p>
          </div>

          {/* Email */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-teal-500" /> Email Hòm Thư
            </span>
            <p className="text-sm font-bold text-slate-800">{user.email || 'Chưa cập nhật'}</p>
          </div>

          {/* Role */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-500" /> Vai Trò Hệ Thống
            </span>
            <p className="text-sm font-bold text-slate-800">{user.role}</p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {isTranslatorOrAdmin && (
            <Link
              to="/my-comics"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Quản Lý Đăng Truyện
            </Link>
          )}

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-colors ml-auto"
          >
            <LogOut className="w-4 h-4" /> Đăng Xuất
          </button>
        </div>

      </div>
    </div>
  );
};
