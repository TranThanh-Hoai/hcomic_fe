import React, { useEffect, useState } from 'react';
import { adminUserService } from '../services/adminUserService';
import type { AdminUserItem, UserRole } from '../types';
import { UserTable } from '../components/admin/UserTable';
import { UserBanModal } from '../components/admin/UserBanModal';
import { UserRoleModal } from '../components/admin/UserRoleModal';
import { Search } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [selectedBanned, setSelectedBanned] = useState<string>(''); // '', 'true', 'false'
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [banModalUser, setBanModalUser] = useState<AdminUserItem | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<AdminUserItem | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, selectedRole, selectedBanned, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const isBannedParam = selectedBanned === '' ? undefined : selectedBanned === 'true';
      const data = await adminUserService.getUsers({
        query: searchQuery || undefined,
        role: (selectedRole as UserRole) || undefined,
        isBanned: isBannedParam,
        page,
        size: 15,
      });
      setUsers(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBanConfirm = async (userId: number, reason: string) => {
    await adminUserService.banUser(userId, { reason });
    fetchUsers();
  };

  const handleUnbanUser = async (userId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn mở khóa tài khoản này?')) {
      await adminUserService.unbanUser(userId);
      fetchUsers();
    }
  };

  const handleRoleConfirm = async (userId: number, role: UserRole) => {
    await adminUserService.updateRole(userId, { role });
    fetchUsers();
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Quản Lý Người Dùng
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Tìm kiếm, phân quyền vai trò (Role), và thực hiện khóa / mở khóa tài khoản thành viên
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#141721] rounded-2xl border border-white/5 p-4 shadow-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo username, email, tên..."
            className="w-full text-xs rounded-xl border border-white/10 pl-9 pr-3 py-2.5 bg-[#090a0f] text-white placeholder-zinc-500 outline-none focus:border-orange-500/50"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value as any);
              setPage(0);
            }}
            className="text-xs rounded-xl border border-white/10 p-2.5 bg-[#090a0f] text-white outline-none focus:border-orange-500/50 cursor-pointer"
          >
            <option value="">Tất cả vai trò</option>
            <option value="USER">USER (Độc giả)</option>
            <option value="TRANSLATOR">TRANSLATOR (Dịch giả)</option>
            <option value="ADMIN">ADMIN (Quản trị viên)</option>
          </select>

          <select
            value={selectedBanned}
            onChange={(e) => {
              setSelectedBanned(e.target.value);
              setPage(0);
            }}
            className="text-xs rounded-xl border border-white/10 p-2.5 bg-[#090a0f] text-white outline-none focus:border-orange-500/50 cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="false">Đang hoạt động (Active)</option>
            <option value="true">Đã bị khóa (Banned)</option>
          </select>
        </div>
      </div>

      <UserTable
        users={users}
        loading={loading}
        onOpenBanModal={(user) => setBanModalUser(user)}
        onUnbanUser={handleUnbanUser}
        onOpenRoleModal={(user) => setRoleModalUser(user)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-[#141721] border border-white/10 rounded-xl hover:bg-white/5 disabled:opacity-40 cursor-pointer"
          >
            Trang trước
          </button>
          <span className="text-xs font-bold text-zinc-400">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-[#141721] border border-white/10 rounded-xl hover:bg-white/5 disabled:opacity-40 cursor-pointer"
          >
            Trang sau
          </button>
        </div>
      )}

      <UserBanModal
        user={banModalUser}
        isOpen={Boolean(banModalUser)}
        onClose={() => setBanModalUser(null)}
        onConfirmBan={handleBanConfirm}
      />

      <UserRoleModal
        user={roleModalUser}
        isOpen={Boolean(roleModalUser)}
        onClose={() => setRoleModalUser(null)}
        onConfirmRole={handleRoleConfirm}
      />
    </div>
  );
};
