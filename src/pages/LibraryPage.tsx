import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { ShelfStatus, UserComicLibraryResponse } from '../types';
import { libraryService } from '../services/libraryService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { getImageUrl } from '../services/apiClient';
import {
  Bookmark,
  Heart,
  BookCheck,
  Clock,
  BookOpen,
  Trash2,
  Lock,
  Sparkles,
} from 'lucide-react';

const TABS: { key: ShelfStatus | 'ALL'; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'ALL', label: 'Tất Cả', icon: Bookmark },
  { key: 'READING', label: 'Đang Đọc', icon: BookOpen },
  { key: 'FAVORITE', label: 'Yêu Thích', icon: Heart },
  { key: 'COMPLETED', label: 'Đã Đọc Xong', icon: BookCheck },
  { key: 'READ_LATER', label: 'Đọc Sau', icon: Clock },
];

export const LibraryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ShelfStatus | 'ALL'>('ALL');
  const [libraryItems, setLibraryItems] = useState<UserComicLibraryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchLibrary();
    }
  }, [isAuthenticated, activeTab]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      setError('');
      const statusParam = activeTab === 'ALL' ? undefined : activeTab;
      const data = await libraryService.getUserLibrary(statusParam);
      setLibraryItems(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách Tủ sách cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromLibrary = async (comicId: number, comicTitle: string) => {
    if (window.confirm(`Bạn có muốn xóa bộ truyện "${comicTitle}" khỏi Tủ sách cá nhân?`)) {
      try {
        await libraryService.updateLibraryStatus(comicId, null);
        setLibraryItems((prev) => prev.filter((item) => item.comicId !== comicId));
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa khỏi tủ sách');
      }
    }
  };

  const handleChangeStatus = async (comicId: number, newStatus: ShelfStatus) => {
    try {
      const updated = await libraryService.updateLibraryStatus(comicId, newStatus);
      if (updated) {
        if (activeTab !== 'ALL' && activeTab !== newStatus) {
          setLibraryItems((prev) => prev.filter((item) => item.comicId !== comicId));
        } else {
          setLibraryItems((prev) =>
            prev.map((item) => (item.comicId === comicId ? { ...item, status: newStatus } : item))
          );
        }
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái tủ sách');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4">
        <div className="p-8 bg-indigo-50/80 border border-indigo-100 rounded-3xl space-y-3">
          <Lock className="w-12 h-12 text-indigo-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Yêu cầu Đăng Nhập</h3>
          <p className="text-xs text-slate-500">
            Vui lòng đăng nhập tài khoản để quản lý Tủ sách cá nhân, phân loại truyện và tự động lưu tiến độ đọc chi tiết.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200"
            >
              Đăng Nhập Ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-indigo-600 fill-indigo-100" />
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Tủ Sách Cá Nhân
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý truyện đang đọc, yêu thích, đã đọc xong và xem lại tiến độ đọc của bạn.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-slate-100 px-3 py-1.5 rounded-xl text-slate-600">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Tổng cộng: {libraryItems.length} bộ truyện</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white h-44 rounded-3xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs text-center">
          {error}
        </div>
      ) : libraryItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 soft-shadow space-y-4">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Tủ sách trống</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'ALL'
              ? 'Bạn chưa thêm bộ truyện nào vào Tủ sách cá nhân. Hãy khám phá và thêm truyện yêu thích ngay!'
              : 'Chưa có bộ truyện nào ở mục này.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Khám Phá Truyện Hay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {libraryItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-4 soft-shadow hover:shadow-lg transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="flex gap-3.5">
                {/* Cover image */}
                <Link to={`/comic/${item.comicSlug}`} className="shrink-0">
                  <img
                    src={getImageUrl(item.coverImage)}
                    alt={item.comicTitle}
                    className="w-20 h-28 object-cover rounded-2xl border border-slate-100 shadow-sm group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200&auto=format&fit=crop';
                    }}
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <StatusBadge status={item.comicStatus} />
                    <button
                      onClick={() => handleRemoveFromLibrary(item.comicId, item.comicTitle)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                      title="Gỡ khỏi tủ sách"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Link
                    to={`/comic/${item.comicSlug}`}
                    className="text-xs font-extrabold text-slate-800 hover:text-indigo-600 block line-clamp-2"
                  >
                    {item.comicTitle}
                  </Link>

                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    Tác giả: {item.author || 'Đang cập nhật'}
                  </p>

                  {/* Reading Status Badge */}
                  <div className="pt-1">
                    <select
                      value={item.status}
                      onChange={(e) => handleChangeStatus(item.comicId, e.target.value as ShelfStatus)}
                      className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-[11px] font-bold rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    >
                      <option value="READING">📖 Đang Đọc</option>
                      <option value="FAVORITE">❤️ Yêu Thích</option>
                      <option value="COMPLETED">✅ Đã Đọc Xong</option>
                      <option value="READ_LATER">⏰ Đọc Sau</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Progress & Read Next Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {item.lastReadChapterNumber != null ? (
                    <div>
                      <span className="text-[11px] font-bold text-indigo-700 block truncate">
                        Đang dừng: Chương {item.lastReadChapterNumber} {item.lastReadPageNumber ? `(Trang ${item.lastReadPageNumber})` : ''}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Cập nhật: {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic block">Chưa bắt đầu đọc</span>
                  )}
                </div>

                {item.lastReadChapterSlug ? (
                  <Link
                    to={`/read/${item.comicSlug}/${item.lastReadChapterSlug}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0 shadow-sm shadow-indigo-200"
                  >
                    Đọc Tiếp →
                  </Link>
                ) : (
                  <Link
                    to={`/comic/${item.comicSlug}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors shrink-0"
                  >
                    Xem Chi Tiết
                  </Link>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
