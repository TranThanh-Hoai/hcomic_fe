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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-indigo-600 fill-indigo-100" />
              <h2 className="text-base font-bold text-slate-800">
                Trang Đã Đánh Dấu {currentChapterNumber ? `(Chương ${currentChapterNumber})` : ''}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bookmark List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {bookmarks.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Chưa có trang nào được đánh dấu</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Ấn biểu tượng Bookmark góc trên mỗi ảnh trang để lưu dấu lại và quay lại sau.
                </p>
              </div>
            ) : (
              bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all"
                >
                  <button
                    onClick={() => {
                      onSelectBookmark(bm.pageNumber);
                      onClose();
                    }}
                    className="flex-1 text-left min-w-0 pr-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-indigo-600 text-white font-extrabold rounded-lg text-xs">
                        Trang {bm.pageNumber}
                      </span>
                      {bm.chapterNumber && (
                        <span className="text-xs text-slate-500 font-medium truncate">
                          Chương {bm.chapterNumber}
                        </span>
                      )}
                    </div>

                    {bm.note && (
                      <p className="text-xs text-slate-600 mt-1.5 italic line-clamp-2">
                        "{bm.note}"
                      </p>
                    )}

                    <span className="text-[10px] text-slate-400 block mt-1">
                      Lưu lúc: {new Date(bm.createdAt).toLocaleTimeString('vi-VN')} {new Date(bm.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onSelectBookmark(bm.pageNumber);
                        onClose();
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors"
                      title="Nhảy đến trang này"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteBookmark(bm.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-[11px] text-slate-400">
            Tổng cộng: <strong>{bookmarks.length}</strong> trang đánh dấu
          </div>

        </div>
      </div>
    </div>
  );
};
