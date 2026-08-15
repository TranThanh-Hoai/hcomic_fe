import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { ChapterDetailResponse, ChapterResponse, CommentResponse, PageBookmarkResponse } from '../types';
import { chapterService } from '../services/chapterService';
import { commentService } from '../services/commentService';
import { historyService } from '../services/historyService';
import { bookmarkService } from '../services/bookmarkService';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/apiClient';
import { CommentSection } from '../components/CommentSection';
import { BookmarkDrawer } from '../components/BookmarkDrawer';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  List,
  CheckCircle,
} from 'lucide-react';

export const ChapterReaderPage: React.FC = () => {
  const { comicSlug, chapterSlug } = useParams<{ comicSlug: string; chapterSlug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [chapterDetail, setChapterDetail] = useState<ChapterDetailResponse | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterResponse[]>([]);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentPage, setCommentPage] = useState<number>(0);
  const [hasMoreComments, setHasMoreComments] = useState<boolean>(false);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [loadingMoreComments, setLoadingMoreComments] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<PageBookmarkResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Auto-scroll notification toast
  const [autoScrollToast, setAutoScrollToast] = useState<string | null>(null);

  // Bookmark Drawer state
  const [isBookmarkDrawerOpen, setIsBookmarkDrawerOpen] = useState<boolean>(false);

  // Active page & scroll tracking
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (comicSlug && chapterSlug) {
      loadChapter(comicSlug, chapterSlug);
    }
  }, [comicSlug, chapterSlug]);

  const loadChapter = async (cSlug: string, chSlug: string) => {
    try {
      setLoading(true);
      setError('');
      setAutoScrollToast(null);

      const detail = await chapterService.getChapterDetailBySlug(cSlug, chSlug);
      setChapterDetail(detail);

      // Load all chapters for select menu
      const chaptersList = await chapterService.getChaptersByComicSlug(cSlug, 'asc');
      setAllChapters(chaptersList);

      // Load chapter comments (Page 0)
      const commentPageRes = await commentService.getChapterComments(detail.id, 0, 10);
      setComments(commentPageRes.content || []);
      setCommentPage(commentPageRes.page || 0);
      setTotalComments(commentPageRes.totalElements || 0);
      setHasMoreComments((commentPageRes.page + 1) < commentPageRes.totalPages);

      // Load Auth related data (Reading progress & Bookmarks)
      if (isAuthenticated) {
        // Load bookmarks
        const bookmarkList = await bookmarkService.getBookmarks({ chapterId: detail.id });
        setBookmarks(bookmarkList);

        // Fetch user reading history for this comic
        const history = await historyService.getProgressByComicId(detail.comicId);

        // If history matches current chapter, auto scroll to pageNumber
        if (history && history.chapterId === detail.id && history.pageNumber > 1) {
          const targetPage = history.pageNumber;
          setTimeout(() => {
            scrollToPage(targetPage);
            setAutoScrollToast(`Tự động cuộn đến Trang ${targetPage} bạn vừa đọc trước đó!`);
            setTimeout(() => setAutoScrollToast(null), 4000);
          }, 400);
        } else {
          window.scrollTo(0, 0);
          // Initial save history for page 1
          debouncedSaveHistory(detail.comicId, detail.id, 1, 0);
        }
      } else {
        window.scrollTo(0, 0);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin chương');
    } finally {
      setLoading(false);
    }
  };

  const scrollToPage = (pageNumber: number) => {
    const el = imageRefs.current[pageNumber];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const debouncedSaveHistory = useCallback(
    (comicId: number, chapterId: number, pageNumber: number, percentage: number) => {
      if (!isAuthenticated) return;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await historyService.saveOrUpdateProgress({
            comicId,
            chapterId,
            pageNumber,
            percentage,
          });
        } catch (err) {
          console.error('Failed to update reading history:', err);
        }
      }, 1000);
    },
    [isAuthenticated]
  );

  // Track active visible page while scrolling
  useEffect(() => {
    if (!chapterDetail || !chapterDetail.images || chapterDetail.images.length === 0) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;
      let activePage = 1;

      const sortedImages = [...chapterDetail.images].sort(
        (a, b) => (a.pageNumber ?? a.imageOrder ?? 0) - (b.pageNumber ?? b.imageOrder ?? 0)
      );

      for (let i = 0; i < sortedImages.length; i++) {
        const pageNum = sortedImages[i].pageNumber ?? sortedImages[i].imageOrder ?? i + 1;
        const el = imageRefs.current[pageNum];
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            activePage = pageNum;
          }
        }
      }

      const totalPages = sortedImages.length;
      const pct = Math.min(100, Math.round((activePage / totalPages) * 100));

      if (activePage !== currentPageNumber) {
        setCurrentPageNumber(activePage);
        debouncedSaveHistory(chapterDetail.comicId, chapterDetail.id, activePage, pct);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [chapterDetail, currentPageNumber, debouncedSaveHistory]);

  const handleToggleBookmark = async (pageNumber: number) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để lưu đánh dấu trang!');
      return;
    }
    if (!chapterDetail) return;

    const existing = bookmarks.find((bm) => bm.pageNumber === pageNumber);
    if (existing) {
      try {
        await bookmarkService.deleteBookmark(existing.id);
        setBookmarks((prev) => prev.filter((bm) => bm.id !== existing.id));
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa bookmark');
      }
    } else {
      try {
        const created = await bookmarkService.createOrUpdateBookmark({
          comicId: chapterDetail.comicId,
          chapterId: chapterDetail.id,
          pageNumber,
        });
        setBookmarks((prev) => [...prev, created]);
      } catch (err: any) {
        alert(err.message || 'Lỗi khi tạo bookmark');
      }
    }
  };

  const handleDeleteBookmark = async (bookmarkId: number) => {
    try {
      await bookmarkService.deleteBookmark(bookmarkId);
      setBookmarks((prev) => prev.filter((bm) => bm.id !== bookmarkId));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa bookmark');
    }
  };

  const handleSelectChapter = (targetSlug: string) => {
    if (comicSlug && targetSlug) {
      navigate(`/read/${comicSlug}/${targetSlug}`);
    }
  };

  const handleLoadMoreComments = async () => {
    if (!chapterDetail || loadingMoreComments) return;
    try {
      setLoadingMoreComments(true);
      const nextPage = commentPage + 1;
      const res = await commentService.getChapterComments(chapterDetail.id, nextPage, 10);
      setComments((prev) => [...prev, ...(res.content || [])]);
      setCommentPage(res.page);
      setHasMoreComments((res.page + 1) < res.totalPages);
    } catch (err) {
      console.error('Failed to load more comments:', err);
    } finally {
      setLoadingMoreComments(false);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!chapterDetail) return;
    const created = await commentService.createChapterComment(chapterDetail.id, content);
    setComments((prev) => [created, ...prev]);
    setTotalComments((prev) => prev + 1);
  };

  const handleUpdateComment = async (commentId: number, content: string) => {
    const updated = await commentService.updateComment(commentId, content);
    setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
  };

  const handleDeleteComment = async (commentId: number) => {
    await commentService.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setTotalComments((prev) => Math.max(0, prev - 1));
  };

  if (loading) {
    return (
      <div className="py-12 max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="bg-white rounded-2xl h-14 border border-slate-200" />
        <div className="bg-white rounded-3xl h-[600px] border border-slate-200" />
      </div>
    );
  }

  if (error || !chapterDetail) {
    return (
      <div className="py-12 text-center max-w-lg mx-auto space-y-4">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          {error || 'Không tìm thấy thông tin chương'}
        </div>
        {comicSlug && (
          <Link to={`/comic/${comicSlug}`} className="inline-block text-xs font-bold text-indigo-600 hover:underline">
            ← Quay lại trang thông tin truyện
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-6 animate-fade-in relative">

      {/* Toast notification when auto-scrolling to last read page */}
      {autoScrollToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-indigo-900/90 text-white px-5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md text-xs font-bold flex items-center gap-2 animate-bounce border border-indigo-500/30">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{autoScrollToast}</span>
        </div>
      )}

      {/* Sticky Reader Header Bar */}
      <div className="sticky top-20 z-30 glass-panel rounded-2xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 border border-slate-200/90">
        <Link
          to={`/comic/${chapterDetail.comicSlug || comicSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="truncate max-w-[130px] sm:max-w-xs">{chapterDetail.comicTitle || 'Trang Truyện'}</span>
        </Link>

        {/* Chapter Switcher, Bookmark drawer button & Prev/Next Controls */}
        <div className="flex items-center gap-2">
          {/* Bookmark list button */}
          <button
            onClick={() => setIsBookmarkDrawerOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
            title="Danh sách trang đánh dấu"
          >
            <Bookmark className="w-3.5 h-3.5 fill-indigo-200" />
            <span className="hidden sm:inline">Bookmarks</span>
            {bookmarks.length > 0 && (
              <span className="ml-0.5 bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {bookmarks.length}
              </span>
            )}
          </button>

          {chapterDetail.prevChapterSlug ? (
            <button
              onClick={() => handleSelectChapter(chapterDetail.prevChapterSlug!)}
              className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-colors"
              title="Chương trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button disabled className="p-2 bg-slate-50 text-slate-300 rounded-xl cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <select
            value={chapterDetail.slug}
            onChange={(e) => handleSelectChapter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {allChapters.map((chap) => (
              <option key={chap.id} value={chap.slug}>
                Chương {chap.chapterNumber}{chap.title ? `: ${chap.title}` : ''}
              </option>
            ))}
          </select>

          {chapterDetail.nextChapterSlug ? (
            <button
              onClick={() => handleSelectChapter(chapterDetail.nextChapterSlug!)}
              className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-colors"
              title="Chương sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button disabled className="p-2 bg-slate-50 text-slate-300 rounded-xl cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chapter Title Banner */}
      <div className="text-center space-y-1 py-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
          Chương {chapterDetail.chapterNumber}{chapterDetail.title ? `: ${chapterDetail.title}` : ''}
        </h1>
        <p className="text-xs text-slate-400">
          Cập nhật ngày {new Date(chapterDetail.createdAt).toLocaleDateString('vi-VN')}
        </p>
      </div>

      {/* Webtoon Vertical Strip Viewer */}
      <div className="bg-white rounded-3xl border border-slate-200/80 soft-shadow p-2 sm:p-4 space-y-3 min-h-[400px]">
        {chapterDetail.images && chapterDetail.images.length > 0 ? (
          [...chapterDetail.images]
            .sort((a, b) => (a.pageNumber ?? a.imageOrder ?? 0) - (b.pageNumber ?? b.imageOrder ?? 0))
            .map((img, idx) => {
              const imagePath = img.imageUrl || img.imagePath;
              const pageNum = img.pageNumber ?? img.imageOrder ?? idx + 1;
              const srcUrl = getImageUrl(imagePath);
              const isBookmarked = bookmarks.some((bm) => bm.pageNumber === pageNum);

              return (
                <div
                  key={img.id || idx}
                  ref={(el) => {
                    imageRefs.current[pageNum] = el;
                  }}
                  className="relative overflow-hidden bg-slate-50 rounded-2xl group border border-slate-100"
                >
                  {/* Overlay Bookmark Action Button */}
                  <div className="absolute top-3 right-3 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleBookmark(pageNum)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all ${isBookmarked
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'bg-slate-900/70 text-white backdrop-blur-md hover:bg-indigo-600'
                        }`}
                      title={isBookmarked ? 'Bỏ đánh dấu trang này' : 'Đánh dấu trang này'}
                    >
                      {isBookmarked ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 fill-white" />
                          <span>Đã Đánh Dấu (Trang {pageNum})</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          <span>Bookmark Trang {pageNum}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Page Image */}
                  {srcUrl ? (
                    <img
                      src={srcUrl}
                      alt={`Trang ${pageNum}`}
                      className="w-full h-auto block mx-auto select-none rounded-xl"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.opacity = '0.4';
                      }}
                    />
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      [Không tìm thấy ảnh trang {pageNum}]
                    </div>
                  )}

                  {/* Bottom Page Indicator Label */}
                  <div className="py-1 text-center bg-slate-100 text-[10px] text-slate-400 font-semibold">
                    — Trang {pageNum} / {chapterDetail.images.length} —
                  </div>
                </div>
              );
            })
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            Chương này chưa có hình ảnh nội dung.
          </div>
        )}
      </div>

      {/* Bottom Navigation Control */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200/80 soft-shadow">
        {chapterDetail.prevChapterSlug ? (
          <button
            onClick={() => handleSelectChapter(chapterDetail.prevChapterSlug!)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Chương Trước
          </button>
        ) : (
          <div />
        )}

        <Link
          to={`/comic/${chapterDetail.comicSlug || comicSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600"
        >
          <List className="w-4 h-4" /> Mục Lục Chương
        </Link>

        {chapterDetail.nextChapterSlug ? (
          <button
            onClick={() => handleSelectChapter(chapterDetail.nextChapterSlug!)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-indigo-200"
          >
            Chương Sau <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Chapter Comments Section */}
      <CommentSection
        comments={comments}
        totalComments={totalComments}
        hasMore={hasMoreComments}
        onLoadMore={handleLoadMoreComments}
        loadingMore={loadingMoreComments}
        onAddComment={handleAddComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
      />

      {/* Bookmark Drawer */}
      <BookmarkDrawer
        isOpen={isBookmarkDrawerOpen}
        onClose={() => setIsBookmarkDrawerOpen(false)}
        bookmarks={bookmarks}
        onSelectBookmark={scrollToPage}
        onDeleteBookmark={handleDeleteBookmark}
        currentChapterNumber={chapterDetail.chapterNumber}
      />

    </div>
  );
};
