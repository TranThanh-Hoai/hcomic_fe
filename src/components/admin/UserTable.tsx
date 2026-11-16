import React from 'react';
import type { AdminUserItem } from '../../types';

interface Props {
  users: AdminUserItem[];
  loading: boolean;
  onOpenBanModal: (user: AdminUserItem) => void;
  onUnbanUser: (userId: number) => void;
  onOpenRoleModal: (user: AdminUserItem) => void;
}

export const UserTable: React.FC<Props> = ({
  users,
  loading,
  onOpenBanModal,
  onUnbanUser,
  onOpenRoleModal,
}) => {
  if (loading) {
    return <div className="py-12 text-center text-zinc-500 text-xs">Đang tải danh sách người dùng...</div>;
  }

  if (users.length === 0) {
    return <div className="py-12 text-center text-zinc-500 text-xs">Không tìm thấy người dùng nào phù hợp.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5 shadow-xl bg-[#141721]">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#090a0f] border-b border-white/5 text-zinc-400 uppercase tracking-wider font-bold">
            <th className="py-3.5 px-4">Tài khoản</th>
            <th className="py-3.5 px-4">Email</th>
            <th className="py-3.5 px-4">Vai trò</th>
            <th className="py-3.5 px-4">Trạng thái</th>
            <th className="py-3.5 px-4">Ngày tạo</th>
            <th className="py-3.5 px-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 font-medium">
          {users.map((user) => (
            <tr key={user.userId} className="hover:bg-white/5 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-black flex items-center justify-center text-xs shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs sm:text-sm">{user.displayName || user.username}</p>
                    <p className="text-zinc-500 text-[10px]">@{user.username}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-zinc-300">{user.email || 'Chưa cập nhật'}</td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    user.role === 'ADMIN'
                      ? 'bg-red-950/60 text-red-400 border-red-500/30'
                      : user.role === 'TRANSLATOR'
                      ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-300 border-white/10'
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="py-3 px-4">
                {user.isBanned ? (
                  <div className="flex flex-col">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 text-red-400 border border-red-500/30 w-fit">
                      ĐÃ KHÓA
                    </span>
                    {user.banReason && (
                      <span className="text-[10px] text-red-400 mt-0.5 truncate max-w-[150px]" title={user.banReason}>
                        Lý do: {user.banReason}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                    HOẠT ĐỘNG
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-zinc-400">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
              </td>
              <td className="py-3 px-4 text-right space-x-2">
                <button
                  onClick={() => onOpenRoleModal(user)}
                  className="px-2.5 py-1 text-zinc-300 hover:text-white bg-[#090a0f] hover:bg-white/10 border border-white/10 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Phân quyền
                </button>
                {user.isBanned ? (
                  <button
                    onClick={() => onUnbanUser(user.userId)}
                    className="px-2.5 py-1 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/30 rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    Mở khóa
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenBanModal(user)}
                    className="px-2.5 py-1 text-red-400 bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    Khóa
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
