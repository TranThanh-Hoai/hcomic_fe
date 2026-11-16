import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { ShelfStatus, UserComicLibraryResponse, ReadingHistoryResponse, PageBookmarkResponse } from '../types';
import { libraryService } from '../services/libraryService';
import { historyService } from '../services/historyService';
import { bookmarkService } from '../services/bookmarkService';
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
  PlayCircle,
  ExternalLink,
  BookmarkCheck,
} from 'lucide-react';

type MainTab = 'SHELF' | 'HISTORY' | 'BOOKMARKS';

const SHELF_SUBTABS: { key: ShelfStatus | 'ALL'; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'ALL', label: 'Tất Cả', icon: Bookmark },
  { key: 'READING', label: 'Đang Đọc', icon: BookOpen },
  { key: 'FAVORITE', label: 'Yêu Thích', icon: Heart },
  { key: 'COMPLETED', label: 'Đã Xong', icon: BookCheck },
  { key: 'READ_LATER', label: 'Đọc Sau', icon: Clock },
];

export const LibraryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // 3 Primary Tabs
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('SHELF');

  // Tab 1: Library Shelf State
  const [shelfSubTab, setShelfSubTab] = useState<ShelfStatus | 'ALL'>('ALL');
  const [libraryItems, setLibraryItems] = useState<UserComicLibraryResponse[]>([]);
  
  // Tab 2: Reading History State
  const [historyItems, setHistoryItems] = useState<ReadingHistoryResponse[]>([]);
  
  // Tab 3: Bookmarks State
  const [bookmarkItems, setBookmarkItems] = useState<PageBookmarkResponse[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeMainTab === 'SHELF') {
      fetchLibrary();
    } else if (activeMainTab === 'HISTORY') {
      fetchHistory();
    } else if (activeMainTab === 'BOOKMARKS') {
      fetchBookmarks();
    }
  }, [isAuthenticated, activeMainTab, shelfSubTab]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      setError('');
      const statusParam = shelfSubTab === 'ALL' ? undefined : shelfSubTab;
      const data = await libraryService.getUserLibrary(statusParam);
      setLibraryItems(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách Tủ sách');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await historyService.getUserHistory();
      setHistoryItems(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch sử đọc');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookmarkService.getBookmarks();
      setBookmarkItems(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách bookmarks');
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

  const handleDeleteBookmark = async (bookmarkId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa trang đánh dấu này?')) {
      try {
        await bookmarkService.deleteBookmark(bookmarkId);
        setBookmarkItems((prev) => prev.filter((item) => item.id !== bookmarkId));
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa bookmark');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4 px-4">
        <div className="p-8 bg-[#141721] border border-white/5 rounded-3xl space-y-4 soft-shadow">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 mx-auto flex items-center justify-center text-orange-400">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Yêu Cầu Đăng Nhập</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Đăng nhập để theo dõi truyện tranh, tự động ghi nhớ trang bạn vừa đọc và quản lý toàn bộ bookmark cá nhân.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
            >
              Đăng Nhập Ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8 animate-fade-in text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tủ Sách & Lịch Sử Cá Nhân
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Không gian lưu trữ, tiếp tục hành trình đọc truyện tranh và các trang đánh dấu của bạn.
          </p>
        </div>

        {/* 3 Main Tabs */}
        <div className="flex items-center gap-1.5 bg-[#141721] p-1.5 rounded-2xl border border-white/5 shrink-0">
          <button
            onClick={() => setActiveMainTab('SHELF')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'SHELF'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Đang Theo Dõi</span>
          </button>

          <button
            onClick={() => setActiveMainTab('HISTORY')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'HISTORY'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Lịch Sử Đọc</span>
          </button>

          <button
            onClick={() => setActiveMainTab('BOOKMARKS')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'BOOKMARKS'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Bookmarks</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: SHELF ================= */}
      {activeMainTab === 'SHELF' && (
        <div className="space-y-6">
          
          {/* Subtabs for Shelves */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {SHELF_SUBTABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = shelfSubTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setShelfSubTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-bold'
                      : 'bg-[#141721] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-44 bg-[#141721] rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-950/30 border border-red-500/20 rounded-2xl text-red-300 text-sm">
              {error}
            </div>
          ) : libraryItems.length === 0 ? (
            <div className="p-16 text-center bg-[#141721] rounded-3xl border border-white/5 soft-shadow space-y-3">
              <BookOpen className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Chưa có truyện nào trong phân loại này</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Khám phá kho truyện tranh và ấn "+ Lưu Vào Tủ Sách" để quản lý tiện lợi.
              </p>
              <div className="pt-2">
                <Link
                  to="/search"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors inline-block"
                >
                  Khám Phá Truyện Mới
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {libraryItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-[#141721] rounded-2xl p-3 border border-white/5 hover:border-orange-500/30 transition-all flex gap-3 soft-shadow relative"
                >
                  {/* Poster Thumbnail */}
                  <Link
                    to={`/comic/${item.comicSlug}`}
                    className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-[#090a0f] border border-white/5 shrink-0 block"
                  >
                    <img
                      src={getImageUrl(item.coverImage)}
                      alt={item.comicTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop';
                      }}
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          to={`/comic/${item.comicSlug}`}
                          className="text-xs font-bold text-white hover:text-orange-400 truncate block transition-colors"
                          title={item.comicTitle}
                        >
                          {item.comicTitle}
                        </Link>
                        <button
                          onClick={() => handleRemoveFromLibrary(item.comicId, item.comicTitle)}
                          className="text-zinc-600 hover:text-red-400 transition-colors p-1 cursor-pointer shrink-0"
                          title="Xóa khỏi tủ sách"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {item.author || 'Đang cập nhật'}
                      </p>

                      <div className="mt-2">
                        <StatusBadge status={item.comicStatus} />
                      </div>
                    </div>

                    <div className="pt-2">
                      {item.lastReadChapterSlug ? (
                        <Link
                          to={`/read/${item.comicSlug}/${item.lastReadChapterSlug}`}
                          className="w-full py-1.5 px-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                        >
                          <PlayCircle className="w-3 h-3" /> Đọc Tiếp Ch.{item.lastReadChapterNumber}
                        </Link>
                      ) : (
                        <Link
                          to={`/comic/${item.comicSlug}`}
                          className="w-full py-1.5 px-2 bg-[#090a0f] hover:bg-white/5 text-zinc-300 rounded-lg text-[10px] font-bold border border-white/5 transition-colors flex items-center justify-center gap-1"
                        >
                          Xem Chi Tiết
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: READING HISTORY ================= */}
      {activeMainTab === 'HISTORY' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[#141721] rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-950/30 border border-red-500/20 rounded-2xl text-red-300 text-sm">
              {error}
            </div>
          ) : historyItems.length === 0 ? (
            <div className="p-16 text-center bg-[#141721] rounded-3xl border border-white/5 soft-shadow space-y-3">
              <Clock className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Chưa có lịch sử đọc truyện</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Bất cứ khi nào bạn mở một chapter truyện, tiến trình sẽ được ghi lại tự động tại đây.
              </p>
              <div className="pt-2">
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors inline-block"
                >
                  Bắt Đầu Đọc Ngay
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {historyItems.map((hist) => (
                <div
                  key={hist.id}
                  className="bg-[#141721] rounded-2xl p-4 border border-white/5 hover:border-orange-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 soft-shadow group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={getImageUrl(hist.coverImage)}
                      alt={hist.comicTitle}
                      className="w-12 h-16 object-cover rounded-xl border border-white/5 bg-[#090a0f] shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop';
                      }}
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/comic/${hist.comicSlug}`}
                        className="text-sm font-bold text-white group-hover:text-orange-400 truncate block transition-colors"
                      >
                        {hist.comicTitle}
                      </Link>
                      <p className="text-xs text-orange-400 font-semibold mt-0.5">
                        Chương {hist.chapterNumber}{hist.chapterTitle ? `: ${hist.chapterTitle}` : ''}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-400">
                        <span>Trang {hist.pageNumber}</span>
                        <span>•</span>
                        <span>Tiến độ: {hist.percentage}%</span>
                        <span>•</span>
                        <span>Cập nhật: {new Date(hist.updatedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      to={`/read/${hist.comicSlug}/${hist.chapterSlug}`}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Đọc Tiếp</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: BOOKMARKS ================= */}
      {activeMainTab === 'BOOKMARKS' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[#141721] rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-950/30 border border-red-500/20 rounded-2xl text-red-300 text-sm">
              {error}
            </div>
          ) : bookmarkItems.length === 0 ? (
            <div className="p-16 text-center bg-[#141721] rounded-3xl border border-white/5 soft-shadow space-y-3">
              <BookmarkCheck className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Chưa có trang nào được đánh dấu</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Trong quá trình đọc truyện, ấn vào nút Bookmark góc mỗi trang để lưu lại danh sách tại đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {bookmarkItems.map((bm) => (
                <div
                  key={bm.id}
                  className="bg-[#141721] rounded-2xl p-4 border border-white/5 hover:border-orange-500/30 transition-all flex flex-col justify-between gap-3 soft-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/comic/${bm.comicSlug}`}
                        className="text-xs font-bold text-white hover:text-orange-400 truncate block transition-colors"
                      >
                        {bm.comicTitle}
                      </Link>
                      <button
                        onClick={() => handleDeleteBookmark(bm.id)}
                        className="text-zinc-600 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="Xóa bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-1 bg-orange-500 text-white rounded-lg text-xs font-black shadow-sm">
                        Trang {bm.pageNumber}
                      </span>
                      <span className="text-xs font-semibold text-zinc-400">
                        Chương {bm.chapterNumber}
                      </span>
                    </div>

                    {bm.note && (
                      <p className="text-xs text-zinc-400 italic mt-2 line-clamp-2">
                        "{bm.note}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">
                      {new Date(bm.createdAt).toLocaleDateString('vi-VN')}
                    </span>

                    <Link
                      to={`/read/${bm.comicSlug}/${bm.chapterSlug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300"
                    >
                      <span>Mở Đọc</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
