import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Users, Layers, ShieldAlert, Shield } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const navItems = [
    {
      to: '/admin',
      label: 'Tổng quan (Analytics)',
      icon: <BarChart3 className="w-4 h-4" />,
      end: true,
    },
    {
      to: '/admin/users',
      label: 'Quản lý Người dùng',
      icon: <Users className="w-4 h-4" />,
    },
    {
      to: '/admin/genres',
      label: 'Quản lý Thể loại',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      to: '/admin/reports',
      label: 'Xử lý Báo cáo',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
  ];

  return (
    <div className="py-6 text-left">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-[#141721] rounded-2xl shadow-xl border border-white/5 p-4 sticky top-20 space-y-4">
            <div className="px-3 py-2 border-b border-white/5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-500/30 text-[10px] font-bold mb-1">
                <Shield className="w-3 h-3" /> ADMIN DASHBOARD
              </div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">HComic Backoffice</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">Quản trị toàn diện nền tảng</p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-orange-500/10 text-orange-400 font-bold border border-orange-500/20 shadow-sm'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
