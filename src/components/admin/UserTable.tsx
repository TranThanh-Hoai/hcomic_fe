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
    return <div className="py-12 text-center text-slate-400 text-sm">Đang tải danh sách người dùng...</div>;
  }

  if (users.length === 0) {
    return <div className="py-12 text-center text-slate-400 text-sm">Không tìm thấy người dùng nào phù hợp.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
            <th className="py-3 px-4">Tài khoản</th>
            <th className="py-3 px-4">Email</th>
            <th className="py-3 px-4">Vai trò</th>
            <th className="py-3 px-4">Trạng thái</th>
            <th className="py-3 px-4">Ngày tạo</th>
            <th className="py-3 px-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium">
          {users.map((user) => (
            <tr key={user.userId} className="hover:bg-slate-50/80 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{user.displayName || user.username}</p>
                    <p className="text-slate-400 text-[11px]">@{user.username}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-slate-600">{user.email || 'Chưa cập nhật'}</td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : user.role === 'TRANSLATOR'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="py-3 px-4">
                {user.isBanned ? (
                  <div className="flex flex-col">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 w-fit">
                      ĐÃ KHÓA
                    </span>
                    {user.banReason && (
                      <span className="text-[10px] text-red-500 mt-0.5 truncate max-w-[150px]" title={user.banReason}>
                        Lý do: {user.banReason}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    HOẠT ĐỘNG
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-slate-500">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
              </td>
              <td className="py-3 px-4 text-right space-x-2">
                <button
                  onClick={() => onOpenRoleModal(user)}
                  className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md font-semibold transition-colors"
                >
                  Phân quyền
                </button>
                {user.isBanned ? (
                  <button
                    onClick={() => onUnbanUser(user.userId)}
                    className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md font-semibold transition-colors"
                  >
                    Mở khóa
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenBanModal(user)}
                    className="px-2.5 py-1 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md font-semibold transition-colors"
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
