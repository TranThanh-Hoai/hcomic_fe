import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { ComicResponse, ChapterResponse, CommentResponse, ComicRequestData, ChapterRequestData, ReadingHistoryResponse } from '../types';
import { comicService } from '../services/comicService';
import { chapterService } from '../services/chapterService';
import { commentService } from '../services/commentService';
import { rateService } from '../services/rateService';
import { likeService } from '../services/likeService';
import { historyService } from '../services/historyService';
import { getImageUrl } from '../services/apiClient';
import { StatusBadge } from '../components/StatusBadge';
import { RatingStars } from '../components/RatingStars';
import { CommentSection } from '../components/CommentSection';
import { ComicModal } from '../components/ComicModal';
import { ChapterModal } from '../components/ChapterModal';
import { ShelfSelector } from '../components/ShelfSelector';
import { GenreBadge } from '../components/GenreBadge';
import { ReportModal } from '../components/ReportModal';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  Heart,
  User,
  BookOpen,
  PlusCircle,
  Edit,
  Trash2,
  ArrowUpDown,
  Calendar,
  Sparkles,
  PlayCircle,
  Flag,
  Search,
} from 'lucide-react';

export const ComicDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [comic, setComic] = useState<ComicResponse | null>(null);
  const [chapters, setChapters] = useState<ChapterResponse[]>([]);
  const [chapterFilterQuery, setChapterFilterQuery] = useState<string>('');
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentPage, setCommentPage] = useState<number>(0);
  const [hasMoreComments, setHasMoreComments] = useState<boolean>(false);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [loadingMoreComments, setLoadingMoreComments] = useState<boolean>(false);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [readingProgress, setReadingProgress] = useState<ReadingHistoryResponse | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modals state
  const [isEditComicOpen, setIsEditComicOpen] = useState<boolean>(false);
  const [isAddChapterOpen, setIsAddChapterOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  useEffect(() => {
    if (slug) {
      loadData(slug);
    }
  }, [slug]);

  const loadData = async (comicSlug: string) => {
    try {
      setLoading(true);
      setError('');
      const comicData = await comicService.getComicBySlug(comicSlug);
      setComic(comicData);
      setLikeCount(comicData.likeCount || 0);

      // Load chapters
      const chapterList = await chapterService.getChaptersByComicSlug(comicSlug, sortOrder);
      setChapters(chapterList);

      // Load comments (Page 0)
      const commentPageRes = await commentService.getComicComments(comicData.id, 0, 10);
      setComments(commentPageRes.content || []);
      setCommentPage(commentPageRes.page || 0);
      setTotalComments(commentPageRes.totalElements || 0);
      setHasMoreComments((commentPageRes.page + 1) < commentPageRes.totalPages);

      // Load Auth related stats if logged in
      if (isAuthenticated) {
        const rating = await rateService.getUserRating(comicData.id);
        if (rating) setUserScore(rating.score);

        const likeStatus = await likeService.getLikeStatus(comicData.id);
        if (likeStatus) {
          setIsLiked(likeStatus.liked);
          setLikeCount(likeStatus.likeCount);
        }

        const history = await historyService.getProgressByComicId(comicData.id);
        setReadingProgress(history);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin truyện');
    } finally {
      setLoading(false);
    }
  };

  const handleSortToggle = async () => {
    if (!slug) return;
    const newSort = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newSort);
    try {
      const chapterList = await chapterService.getChaptersByComicSlug(slug, newSort);
      setChapters(chapterList);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRate = async (score: number) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đánh giá truyện');
      return;
    }
    if (!comic) return;
    try {
      await rateService.rateComic(comic.id, score);
      setUserScore(score);
      const avg = await rateService.getAverageRating(comic.id);
      setComic((prev) => (prev ? { ...prev, rating: avg } : null));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đánh giá');
    }
  };

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thực hiện thích truyện');
      return;
    }
    if (!comic) return;
    try {
      const res = await likeService.toggleLike(comic.id);
      setIsLiked(res.liked);
      setLikeCount(res.likeCount);
      setComic((prev) => (prev ? { ...prev, likeCount: res.likeCount } : null));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thả tim');
    }
  };

  const handleUpdateComic = async (data: ComicRequestData, coverFile: File | null) => {
    if (!comic) return;
    const updated = await comicService.updateComic(comic.id, data, coverFile);
    setComic(updated);
    if (updated.slug !== slug) {
      navigate(`/comic/${updated.slug}`, { replace: true });
    }
  };

  const handleDeleteComic = async () => {
    if (!comic) return;
    if (window.confirm(`Bạn có chắc muốn xóa truyện "${comic.title}"? Thao tác này không thể hoàn tác.`)) {
      try {
        await comicService.deleteComic(comic.id);
        navigate('/');
      } catch (err: any) {
        alert(err.message || 'Không thể xóa truyện');
      }
    }
  };

  const handleCreateChapter = async (data: ChapterRequestData, imageFiles: File[]) => {
    if (!comic) return;
    await chapterService.createChapter(comic.id, data, imageFiles);
    if (slug) {
      const updatedChapters = await chapterService.getChaptersByComicSlug(slug, sortOrder);
      setChapters(updatedChapters);
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (window.confirm('Bạn có chắc muốn xóa chương này?')) {
      try {
        await chapterService.deleteChapter(chapterId);
        setChapters((prev) => prev.filter((c) => c.id !== chapterId));
      } catch (err: any) {
        alert(err.message || 'Không thể xóa chương');
      }
    }
  };

  const handleLoadMoreComments = async () => {
    if (!comic || loadingMoreComments) return;
    try {
      setLoadingMoreComments(true);
      const nextPage = commentPage + 1;
      const res = await commentService.getComicComments(comic.id, nextPage, 10);
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
    if (!comic) return;
    const created = await commentService.createComicComment(comic.id, content);
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
      <div className="py-12 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="bg-[#141721] rounded-3xl h-80 border border-white/5" />
        <div className="bg-[#141721] rounded-2xl h-48 border border-white/5" />
      </div>
    );
  }

  if (error || !comic) {
    return (
      <div className="py-12 text-center max-w-lg mx-auto space-y-4">
        <div className="p-6 bg-red-950/30 border border-red-500/20 rounded-2xl text-red-300 text-sm">
          {error || 'Không tìm thấy truyện yêu cầu'}
        </div>
        <Link to="/" className="inline-block text-xs font-bold text-orange-400 hover:underline">
          ← Trở về Trang Chủ
        </Link>
      </div>
    );
  }

  const isOwnerOrAdmin =
    user && (user.role === 'ADMIN' || (user.role === 'TRANSLATOR' && comic.uploader === user.username));

  // Determine first chapter and latest chapter
  const sortedAsc = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const firstChapter = sortedAsc.length > 0 ? sortedAsc[0] : null;
  const latestChapter = sortedAsc.length > 0 ? sortedAsc[sortedAsc.length - 1] : null;

  // Filtered chapters
  const filteredChapters = chapters.filter((c) => {
    if (!chapterFilterQuery.trim()) return true;
    const q = chapterFilterQuery.toLowerCase();
    return (
      c.chapterNumber.toString().includes(q) ||
      (c.title && c.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="py-6 space-y-8 animate-fade-in text-left">
      
      {/* Top Banner Card with Blurred Background */}
      <div className="relative rounded-3xl overflow-hidden bg-[#141721] border border-white/5 soft-shadow">
        
        {/* Backdrop cover blur */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={getImageUrl(comic.coverImage)}
            alt={comic.title}
            className="w-full h-full object-cover blur-3xl scale-125 opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e1017] via-[#0e1017]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141721] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
            
            {/* 3:4 High-res Cover Image */}
            <div className="relative w-48 sm:w-60 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 mx-auto md:mx-0 bg-[#090a0f] group">
              <img
                src={getImageUrl(comic.coverImage)}
                alt={comic.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop';
                }}
              />
              <div className="absolute top-3 left-3 z-10">
                <StatusBadge status={comic.status} />
              </div>
            </div>

            {/* Details Column */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {comic.title}
                  </h1>

                  {/* Actions for Admin / Owner */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isOwnerOrAdmin && (
                      <>
                        <button
                          onClick={() => setIsEditComicOpen(true)}
                          className="p-2 text-zinc-400 hover:text-white bg-[#090a0f] hover:bg-white/5 rounded-xl border border-white/5 transition-colors cursor-pointer"
                          title="Sửa truyện"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleDeleteComic}
                          className="p-2 text-zinc-400 hover:text-red-400 bg-[#090a0f] hover:bg-red-950/30 rounded-xl border border-white/5 transition-colors cursor-pointer"
                          title="Xóa truyện"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Report Violation Button */}
                    <button
                      onClick={() => setIsReportOpen(true)}
                      className="p-2 text-zinc-500 hover:text-amber-400 bg-[#090a0f] hover:bg-white/5 rounded-xl border border-white/5 transition-colors cursor-pointer"
                      title="Báo cáo vi phạm"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Author & Uploader & Date */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-orange-400" /> Tác giả: <strong className="text-zinc-200">{comic.author || 'Đang cập nhật'}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Dịch giả: <strong className="text-zinc-200">{comic.uploader || 'HComic Team'}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Ngày đăng: {new Date(comic.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {/* Genres */}
                {comic.genres && comic.genres.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs font-bold text-zinc-400 mr-1">Thể loại:</span>
                    {comic.genres.map((genre) => (
                      <GenreBadge key={genre.id} genre={genre} size="sm" />
                    ))}
                  </div>
                )}

                {/* Description */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-[#090a0f] p-4 rounded-2xl border border-white/5 mt-2 whitespace-pre-line">
                  {comic.description || 'Chưa có mô tả chi tiết cho bộ truyện này.'}
                </p>
              </div>

              {/* Metrics & Interactive Buttons */}
              <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                
                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
                      ĐÁNH GIÁ TRUNG BÌNH
                    </span>
                    <RatingStars rating={comic.rating} size={16} />
                  </div>

                  <div className="border-l border-white/10 pl-6">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
                      LƯỢT XEM
                    </span>
                    <span className="text-sm font-black text-white flex items-center gap-1">
                      <Eye className="w-4 h-4 text-zinc-500" />
                      {comic.viewCount?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <ShelfSelector comicId={comic.id} />

                  <button
                    onClick={handleToggleLike}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border cursor-pointer ${
                      isLiked
                        ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/25'
                        : 'bg-[#090a0f] text-rose-400 border-white/10 hover:border-rose-500/40 hover:bg-rose-950/20'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : 'fill-rose-500 text-rose-500'}`} />
                    <span>{isLiked ? 'Đã Thích' : 'Yêu Thích'} ({likeCount})</span>
                  </button>

                  {readingProgress && readingProgress.chapterSlug ? (
                    <Link
                      to={`/read/${comic.slug}/${readingProgress.chapterSlug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 hover:scale-105"
                    >
                      <PlayCircle className="w-4 h-4" /> Đọc Tiếp (Chương {readingProgress.chapterNumber})
                    </Link>
                  ) : firstChapter ? (
                    <Link
                      to={`/read/${comic.slug}/${firstChapter.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-500/25 hover:scale-105"
                    >
                      <BookOpen className="w-4 h-4" /> Đọc Từ Đầu
                    </Link>
                  ) : null}

                  {latestChapter && latestChapter !== firstChapter && (!readingProgress || readingProgress.chapterSlug !== latestChapter.slug) && (
                    <Link
                      to={`/read/${comic.slug}/${latestChapter.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#090a0f] hover:bg-white/5 text-zinc-200 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition-all"
                    >
                      Chương Mới Nhất
                    </Link>
                  )}
                </div>

              </div>

              {/* User Interactive Rating Input */}
              {isAuthenticated && (
                <div className="bg-[#090a0f] border border-white/5 p-3 rounded-2xl flex items-center justify-between text-xs text-zinc-300">
                  <span className="font-semibold">Đánh giá của bạn về truyện:</span>
                  <RatingStars
                    rating={userScore || 0}
                    readOnly={false}
                    onRate={handleRate}
                    size={18}
                  />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="bg-[#141721] rounded-3xl p-6 sm:p-8 border border-white/5 soft-shadow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Danh Sách Chương ({chapters.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick search chapter input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm số chương..."
                value={chapterFilterQuery}
                onChange={(e) => setChapterFilterQuery(e.target.value)}
                className="w-36 sm:w-44 pl-8 pr-3 py-1.5 text-xs bg-[#090a0f] text-white border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            </div>

            <button
              onClick={handleSortToggle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#090a0f] hover:bg-white/5 text-zinc-300 rounded-xl text-xs font-semibold border border-white/5 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? 'Mới nhất trước' : 'Cũ nhất trước'}</span>
            </button>

            {isOwnerOrAdmin && (
              <button
                onClick={() => setIsAddChapterOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Thêm Chương Mới
              </button>
            )}
          </div>
        </div>

        {chapters.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-8">
            Chưa có chương nào được tải lên cho bộ truyện này.
          </p>
        ) : filteredChapters.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-8">
            Không tìm thấy chương nào khớp với "{chapterFilterQuery}".
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredChapters.map((chap) => (
              <div
                key={chap.id}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#090a0f] border border-white/5 hover:border-orange-500/30 hover:bg-white/5 transition-all"
              >
                <Link
                  to={`/read/${comic.slug}/${chap.slug}`}
                  className="flex-1 min-w-0 pr-2"
                >
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-orange-400 block truncate transition-colors">
                    Chương {chap.chapterNumber}{chap.title ? `: ${chap.title}` : ''}
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">
                    {new Date(chap.createdAt).toLocaleDateString('vi-VN')} • {chap.viewCount?.toLocaleString() || 0} lượt xem
                  </span>
                </Link>

                {isOwnerOrAdmin && (
                  <button
                    onClick={() => handleDeleteChapter(chap.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-400 transition-all rounded-lg hover:bg-white/5 cursor-pointer"
                    title="Xóa chương"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comic Comments Section */}
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

      {/* Edit Comic Modal */}
      {isEditComicOpen && (
        <ComicModal
          isOpen={isEditComicOpen}
          onClose={() => setIsEditComicOpen(false)}
          onSubmit={handleUpdateComic}
          initialData={comic}
        />
      )}

      {/* Add Chapter Modal */}
      {isAddChapterOpen && (
        <ChapterModal
          isOpen={isAddChapterOpen}
          onClose={() => setIsAddChapterOpen(false)}
          onSubmit={handleCreateChapter}
          comicTitle={comic.title}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportType="COMIC"
        targetId={comic.id}
        targetTitle={comic.title}
      />

    </div>
  );
};
