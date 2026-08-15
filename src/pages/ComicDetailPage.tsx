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
} from 'lucide-react';

export const ComicDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [comic, setComic] = useState<ComicResponse | null>(null);
  const [chapters, setChapters] = useState<ChapterResponse[]>([]);
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
      // Refresh avg rating
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
    // Refresh chapters
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
        <div className="bg-white rounded-3xl h-80 border border-slate-200" />
        <div className="bg-white rounded-2xl h-48 border border-slate-200" />
      </div>
    );
  }

  if (error || !comic) {
    return (
      <div className="py-12 text-center max-w-lg mx-auto space-y-4">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          {error || 'Không tìm thấy truyện yêu cầu'}
        </div>
        <Link to="/" className="inline-block text-xs font-bold text-indigo-600 hover:underline">
          ← Trở về Trang Chủ
        </Link>
      </div>
    );
  }

  const isOwnerOrAdmin =
    user && (user.role === 'ADMIN' || (user.role === 'TRANSLATOR' && comic.uploader === user.username));

  const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
  const latestChapter = chapters.length > 0 ? chapters[0] : null;

  return (
    <div className="py-8 space-y-8 animate-fade-in">
      
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 soft-shadow">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
          
          {/* Cover Image */}
          <div className="relative w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg shadow-slate-200 shrink-0 mx-auto md:mx-0 bg-slate-100">
            <img
              src={getImageUrl(comic.coverImage)}
              alt={comic.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop';
              }}
            />
            <div className="absolute top-3 left-3">
              <StatusBadge status={comic.status} />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                  {comic.title}
                </h1>

                {/* Admin/Owner Buttons */}
                {isOwnerOrAdmin && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsEditComicOpen(true)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-200/60 transition-colors"
                      title="Sửa truyện"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDeleteComic}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200/60 transition-colors"
                      title="Xóa truyện"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Author & Uploader Info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" /> Tác giả: <strong className="text-slate-700">{comic.author || 'Đang cập nhật'}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-500" /> Người đăng: <strong className="text-slate-700">{comic.uploader || 'HComic System'}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày tạo: {new Date(comic.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {/* Genres Badge List */}
              {comic.genres && comic.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs font-semibold text-slate-500 mr-1">Thể loại:</span>
                  {comic.genres.map((genre) => (
                    <GenreBadge key={genre.id} genre={genre} size="sm" />
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-3 whitespace-pre-line">
                {comic.description || 'Chưa có mô tả chi tiết cho bộ truyện này.'}
              </p>
            </div>

            {/* Metrics & Rating */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">ĐÁNH GIÁ TRUNG BÌNH</span>
                  <RatingStars rating={comic.rating} size={18} />
                </div>

                <div className="border-l border-slate-200 pl-6">
                  <span className="text-[11px] font-semibold text-slate-400 block">LƯỢT XEM</span>
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    <Eye className="w-4 h-4 text-slate-400" />
                    {comic.viewCount?.toLocaleString() || 0}
                  </span>
                </div>
              </div>

              {/* Interactive Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <ShelfSelector comicId={comic.id} />

                <button
                  onClick={handleToggleLike}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isLiked
                      ? 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600'
                      : 'bg-rose-50 text-rose-600 border border-rose-200/80 hover:bg-rose-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : 'fill-rose-500'}`} />
                  <span>{isLiked ? 'Đã Thích' : 'Yêu Thích'} ({likeCount})</span>
                </button>

                {readingProgress && readingProgress.chapterSlug ? (
                  <Link
                    to={`/read/${comic.slug}/${readingProgress.chapterSlug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-200"
                  >
                    <PlayCircle className="w-4 h-4" /> Đọc Tiếp (Chương {readingProgress.chapterNumber}{readingProgress.pageNumber ? ` - Trang ${readingProgress.pageNumber}` : ''})
                  </Link>
                ) : firstChapter ? (
                  <Link
                    to={`/read/${comic.slug}/${firstChapter.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200"
                  >
                    <BookOpen className="w-4 h-4" /> Đọc Từ Đầu
                  </Link>
                ) : null}

                {latestChapter && latestChapter !== firstChapter && (!readingProgress || readingProgress.chapterSlug !== latestChapter.slug) && (
                  <Link
                    to={`/read/${comic.slug}/${latestChapter.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-200"
                  >
                    Chương Mới Nhất
                  </Link>
                )}
              </div>
            </div>

            {/* Interactive User Star Rate Input */}
            {isAuthenticated && (
              <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                <span>Đánh giá của bạn:</span>
                <RatingStars
                  rating={userScore || 0}
                  readOnly={false}
                  onRate={handleRate}
                  size={20}
                />
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 soft-shadow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">
              Danh Sách Chương ({chapters.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSortToggle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortOrder === 'desc' ? 'Mới nhất trước' : 'Cũ nhất trước'}
            </button>

            {isOwnerOrAdmin && (
              <button
                onClick={() => setIsAddChapterOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-200"
              >
                <PlusCircle className="w-4 h-4" /> Thêm Chương Mới
              </button>
            )}
          </div>
        </div>

        {chapters.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            Chưa có chương nào được tải lên cho bộ truyện này.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {chapters.map((chap) => (
              <div
                key={chap.id}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-indigo-50/60 hover:border-indigo-200 transition-all"
              >
                <Link
                  to={`/read/${comic.slug}/${chap.slug}`}
                  className="flex-1 min-w-0 pr-2"
                >
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 block truncate">
                    Chương {chap.chapterNumber}{chap.title ? `: ${chap.title}` : ''}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {new Date(chap.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </Link>

                {isOwnerOrAdmin && (
                  <button
                    onClick={() => handleDeleteChapter(chap.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 transition-all rounded-lg hover:bg-white"
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

    </div>
  );
};
