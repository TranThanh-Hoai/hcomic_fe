import React from 'react';
import type { PageBookmarkResponse } from '../types';
import { X, Bookmark, Trash2, ExternalLink } from 'lucide-react';

interface BookmarkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: PageBookmarkResponse[];
  onSelectBookmark: (pageNumber: number) => void;
  onDeleteBookmark: (bookmarkId: number) => void;
  currentChapterNumber?: number;
}

export const BookmarkDrawer: React.FC<BookmarkDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onSelectBookmark,
  onDeleteBookmark,
  currentChapterNumber,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#141721] shadow-2xl flex flex-col border-l border-white/10">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between bg-[#0e1017]">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-orange-400 fill-orange-400/20" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Trang Đã Đánh Dấu {currentChapterNumber ? `(Chương ${currentChapterNumber})` : ''}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bookmark List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {bookmarks.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Bookmark className="w-10 h-10 text-zinc-600 mx-auto" />
                <p className="text-xs font-bold text-zinc-300">Chưa có trang nào được đánh dấu</p>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                  Ấn nút Bookmark trên mỗi trang ảnh để lưu dấu lại và quay lại sau bất cứ lúc nào.
                </p>
              </div>
            ) : (
              bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="group flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-[#090a0f] hover:border-orange-500/30 transition-all"
                >
                  <button
                    onClick={() => {
                      onSelectBookmark(bm.pageNumber);
                      onClose();
                    }}
                    className="flex-1 text-left min-w-0 pr-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-orange-500 text-white font-extrabold rounded-lg text-xs shadow-sm shadow-orange-500/25">
                        Trang {bm.pageNumber}
                      </span>
                      {bm.chapterNumber && (
                        <span className="text-xs text-zinc-400 font-medium truncate">
                          Chương {bm.chapterNumber}
                        </span>
                      )}
                    </div>

                    {bm.note && (
                      <p className="text-xs text-zinc-300 mt-1.5 italic line-clamp-2">
                        "{bm.note}"
                      </p>
                    )}

                    <span className="text-[10px] text-zinc-500 block mt-1">
                      Lưu lúc: {new Date(bm.createdAt).toLocaleTimeString('vi-VN')} {new Date(bm.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onSelectBookmark(bm.pageNumber);
                        onClose();
                      }}
                      className="p-2 text-orange-400 hover:bg-orange-500/10 rounded-xl transition-colors cursor-pointer"
                      title="Nhảy đến trang này"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteBookmark(bm.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer"
                      title="Xóa bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-white/5 bg-[#0e1017] text-center text-[11px] text-zinc-400">
            Tổng cộng: <strong className="text-orange-400">{bookmarks.length}</strong> trang đánh dấu
          </div>

        </div>
      </div>
    </div>
  );
};
