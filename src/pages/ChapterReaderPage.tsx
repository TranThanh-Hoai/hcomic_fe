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
  CheckCircle,
  ArrowUp,
  Maximize2,
  Minimize2,
  Sliders,
  List,
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

  // Zen mode & reader preferences
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [readerWidth, setReaderWidth] = useState<'standard' | 'wide' | 'full'>('standard');
  const lastScrollY = useRef<number>(0);

  // Active page & scroll tracking
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
  const [readingPercent, setReadingPercent] = useState<number>(0);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Zen Mode auto-hide header when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Zen mode toggle on scroll direction
      if (currentScrollY > 150) {
        if (currentScrollY > lastScrollY.current + 10) {
          // Scrolling down
          setIsZenMode(true);
        } else if (currentScrollY < lastScrollY.current - 15) {
          // Scrolling up
          setIsZenMode(false);
        }
      } else {
        setIsZenMode(false);
      }

      lastScrollY.current = currentScrollY;

      // Track active page
      if (!chapterDetail || !chapterDetail.images || chapterDetail.images.length === 0) return;

      const scrollPos = currentScrollY + window.innerHeight / 3;
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
      setReadingPercent(pct);

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

  // Reader container width styling
  const widthContainerClass =
    readerWidth === 'standard'
      ? 'max-w-3xl'
      : readerWidth === 'wide'
      ? 'max-w-5xl'
      : 'max-w-none px-0 sm:px-4';

  if (loading) {
    return (
      <div className="py-12 max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="bg-[#141721] rounded-2xl h-14 border border-white/5" />
        <div className="bg-[#141721] rounded-3xl h-[600px] border border-white/5" />
      </div>
    );
  }

  if (error || !chapterDetail) {
    return (
      <div className="py-12 text-center max-w-lg mx-auto space-y-4">
        <div className="p-6 bg-red-950/30 border border-red-500/20 rounded-2xl text-red-300 text-sm">
          {error || 'Không tìm thấy thông tin chương'}
        </div>
        {comicSlug && (
          <Link to={`/comic/${comicSlug}`} className="inline-block text-xs font-bold text-orange-400 hover:underline">
            ← Quay lại trang thông tin truyện
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`py-4 mx-auto space-y-6 animate-fade-in relative ${widthContainerClass}`}>

      {/* Auto-scroll Toast */}
      {autoScrollToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#141721]/95 text-white px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2 border border-orange-500/30 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{autoScrollToast}</span>
        </div>
      )}

      {/* Header Bar (Auto-hides in Zen Mode) */}
      <div
        className={`sticky top-16 z-30 transition-all duration-300 ${
          isZenMode ? '-translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="reader-floating-island rounded-2xl p-3 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/comic/${chapterDetail.comicSlug || comicSlug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="truncate max-w-[140px] sm:max-w-xs">{chapterDetail.comicTitle || 'Trang Truyện'}</span>
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookmarkDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141721] hover:bg-orange-500/10 text-orange-400 border border-white/5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Danh sách trang đánh dấu"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bookmarks</span>
              {bookmarks.length > 0 && (
                <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {bookmarks.length}
                </span>
              )}
            </button>

            {/* Prev chapter */}
            {chapterDetail.prevChapterSlug ? (
              <button
                onClick={() => handleSelectChapter(chapterDetail.prevChapterSlug!)}
                className="p-2 bg-[#141721] hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl border border-white/5 transition-colors cursor-pointer"
                title="Chương trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button disabled className="p-2 bg-[#141721] text-zinc-600 rounded-xl border border-white/5 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Chapter Select */}
            <select
              value={chapterDetail.slug}
              onChange={(e) => handleSelectChapter(e.target.value)}
              className="px-3 py-1.5 bg-[#090a0f] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500/50"
            >
              {allChapters.map((chap) => (
                <option key={chap.id} value={chap.slug}>
                  Chương {chap.chapterNumber}{chap.title ? `: ${chap.title}` : ''}
                </option>
              ))}
            </select>

            {/* Next chapter */}
            {chapterDetail.nextChapterSlug ? (
              <button
                onClick={() => handleSelectChapter(chapterDetail.nextChapterSlug!)}
                className="p-2 bg-[#141721] hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl border border-white/5 transition-colors cursor-pointer"
                title="Chương sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button disabled className="p-2 bg-[#141721] text-zinc-600 rounded-xl border border-white/5 cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chapter Title Banner */}
      <div className="text-center space-y-1 py-1">
        <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
          Chương {chapterDetail.chapterNumber}{chapterDetail.title ? `: ${chapterDetail.title}` : ''}
        </h1>
        <p className="text-xs text-zinc-500">
          Cập nhật ngày {new Date(chapterDetail.createdAt).toLocaleDateString('vi-VN')} • {chapterDetail.images?.length || 0} trang
        </p>
      </div>

      {/* Webtoon Vertical Strip Viewer */}
      <div className="bg-[#090a0f] rounded-3xl border border-white/5 soft-shadow p-1 sm:p-2 space-y-1 sm:space-y-2 min-h-[400px]">
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
                  className="relative overflow-hidden bg-black group"
                >
                  {/* Overlay Bookmark Action Button */}
                  <div className="absolute top-3 right-3 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleBookmark(pageNum)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl backdrop-blur-md transition-all cursor-pointer ${
                        isBookmarked
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/30'
                          : 'bg-black/70 text-zinc-300 hover:text-white hover:bg-orange-500 border border-white/10'
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
                      className="w-full h-auto block mx-auto select-none rounded-sm"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.opacity = '0.4';
                      }}
                    />
                  ) : (
                    <div className="p-8 text-center text-zinc-600 text-xs">
                      [Không tìm thấy ảnh trang {pageNum}]
                    </div>
                  )}

                  {/* Subtle Page Indicator Bar */}
                  <div className="py-1 text-center bg-[#090a0f] text-[10px] text-zinc-600 font-semibold tracking-wider">
                    — Trang {pageNum} / {chapterDetail.images.length} —
                  </div>
                </div>
              );
            })
        ) : (
          <div className="p-16 text-center text-zinc-500 text-xs">
            Chương này chưa có hình ảnh nội dung.
          </div>
        )}
      </div>

      {/* Bottom Chapter Switcher Navigation */}
      <div className="flex items-center justify-between bg-[#141721] rounded-2xl p-4 border border-white/5 soft-shadow">
        {chapterDetail.prevChapterSlug ? (
          <button
            onClick={() => handleSelectChapter(chapterDetail.prevChapterSlug!)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#090a0f] hover:bg-white/5 text-zinc-200 hover:text-orange-400 rounded-xl text-xs font-bold border border-white/5 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Chương Trước
          </button>
        ) : (
          <div />
        )}

        <Link
          to={`/comic/${chapterDetail.comicSlug || comicSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-orange-400"
        >
          <List className="w-4 h-4" /> Mục Lục Chương
        </Link>

        {chapterDetail.nextChapterSlug ? (
          <button
            onClick={() => handleSelectChapter(chapterDetail.nextChapterSlug!)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 cursor-pointer"
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

      {/* Floating Control Island (Zen & Quick Access) */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 reader-floating-island rounded-full px-4 py-2 shadow-2xl flex items-center gap-2 sm:gap-3 transition-transform duration-300">
        
        {/* Comic Detail Link */}
        <Link
          to={`/comic/${chapterDetail.comicSlug || comicSlug}`}
          className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Thông tin truyện"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {/* Prev Chapter */}
        <button
          disabled={!chapterDetail.prevChapterSlug}
          onClick={() => chapterDetail.prevChapterSlug && handleSelectChapter(chapterDetail.prevChapterSlug)}
          className="p-1.5 text-zinc-300 hover:text-orange-400 disabled:opacity-30 disabled:hover:text-zinc-500 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title="Chương trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Quick Chapter Selector */}
        <select
          value={chapterDetail.slug}
          onChange={(e) => handleSelectChapter(e.target.value)}
          className="bg-transparent text-xs font-bold text-white border-none focus:outline-none cursor-pointer max-w-[120px] sm:max-w-[150px] truncate"
        >
          {allChapters.map((chap) => (
            <option key={chap.id} value={chap.slug} className="bg-[#141721] text-white">
              Chương {chap.chapterNumber}
            </option>
          ))}
        </select>

        {/* Next Chapter */}
        <button
          disabled={!chapterDetail.nextChapterSlug}
          onClick={() => chapterDetail.nextChapterSlug && handleSelectChapter(chapterDetail.nextChapterSlug)}
          className="p-1.5 text-zinc-300 hover:text-orange-400 disabled:opacity-30 disabled:hover:text-zinc-500 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title="Chương sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-0.5" />

        {/* Reading Progress Indicator */}
        <span className="text-[10px] font-bold text-orange-400 hidden sm:inline whitespace-nowrap">
          {readingPercent}% (Trang {currentPageNumber}/{chapterDetail.images?.length || 1})
        </span>

        {/* Toggle Reader Width */}
        <button
          onClick={() => {
            setReaderWidth((prev) =>
              prev === 'standard' ? 'wide' : prev === 'wide' ? 'full' : 'standard'
            );
          }}
          className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer hidden sm:inline-flex"
          title={`Độ rộng khung đọc: ${readerWidth}`}
        >
          {readerWidth === 'standard' ? (
            <Sliders className="w-4 h-4" />
          ) : readerWidth === 'wide' ? (
            <Maximize2 className="w-4 h-4" />
          ) : (
            <Minimize2 className="w-4 h-4" />
          )}
        </button>

        {/* Bookmark Drawer Button */}
        <button
          onClick={() => setIsBookmarkDrawerOpen(true)}
          className="p-1.5 text-zinc-400 hover:text-orange-400 rounded-full hover:bg-white/10 transition-colors relative cursor-pointer"
          title="Bookmarks"
        >
          <Bookmark className="w-4 h-4" />
          {bookmarks.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500" />
          )}
        </button>

        {/* Scroll To Top */}
        <button
          onClick={scrollToTop}
          className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title="Lên đầu trang"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
