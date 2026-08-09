import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { ChapterDetailResponse, ChapterResponse, CommentResponse } from '../types';
import { chapterService } from '../services/chapterService';
import { commentService } from '../services/commentService';
import { getImageUrl } from '../services/apiClient';
import { CommentSection } from '../components/CommentSection';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  List,
} from 'lucide-react';

export const ChapterReaderPage: React.FC = () => {
  const { comicSlug, chapterSlug } = useParams<{ comicSlug: string; chapterSlug: string }>();
  const navigate = useNavigate();

  const [chapterDetail, setChapterDetail] = useState<ChapterDetailResponse | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterResponse[]>([]);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (comicSlug && chapterSlug) {
      loadChapter(comicSlug, chapterSlug);
    }
  }, [comicSlug, chapterSlug]);

  const loadChapter = async (cSlug: string, chSlug: string) => {
    try {
      setLoading(true);
      setError('');
      window.scrollTo(0, 0);

      const detail = await chapterService.getChapterDetailBySlug(cSlug, chSlug);
      setChapterDetail(detail);

      // Load all chapters for select menu
      const chaptersList = await chapterService.getChaptersByComicSlug(cSlug, 'asc');
      setAllChapters(chaptersList);

      // Load chapter comments
      const commentList = await commentService.getChapterComments(detail.id);
      setComments(commentList);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin chương');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChapter = (targetSlug: string) => {
    if (comicSlug && targetSlug) {
      navigate(`/read/${comicSlug}/${targetSlug}`);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!chapterDetail) return;
    const created = await commentService.createChapterComment(chapterDetail.id, content);
    setComments((prev) => [created, ...prev]);
  };

  const handleUpdateComment = async (commentId: number, content: string) => {
    const updated = await commentService.updateComment(commentId, content);
    setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
  };

  const handleDeleteComment = async (commentId: number) => {
    await commentService.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
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
    <div className="py-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Sticky Reader Header Bar */}
      <div className="sticky top-20 z-30 glass-panel rounded-2xl p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3 border border-slate-200/90">
        <Link
          to={`/comic/${chapterDetail.comicSlug || comicSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="truncate max-w-[150px] sm:max-w-xs">{chapterDetail.comicTitle || 'Trang Truyện'}</span>
        </Link>

        {/* Chapter Switcher & Prev/Next Controls */}
        <div className="flex items-center gap-2">
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
      <div className="bg-white rounded-3xl border border-slate-200/80 soft-shadow p-2 sm:p-4 space-y-1 min-h-[400px]">
        {chapterDetail.images && chapterDetail.images.length > 0 ? (
          [...chapterDetail.images]
            .sort((a, b) => (a.pageNumber ?? a.imageOrder ?? 0) - (b.pageNumber ?? b.imageOrder ?? 0))
            .map((img, idx) => {
              const imagePath = img.imageUrl || img.imagePath;
              const pageNum = img.pageNumber ?? img.imageOrder ?? idx + 1;
              const srcUrl = getImageUrl(imagePath);

              return (
                <div key={img.id || idx} className="relative overflow-hidden bg-slate-50">
                  {srcUrl ? (
                    <img
                      src={srcUrl}
                      alt={`Trang ${pageNum}`}
                      className="w-full h-auto block mx-auto select-none"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.opacity = '0.4';
                      }}
                    />
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      [Không tìm thấy ảnh trang {pageNum}]
                    </div>
                  )}
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
        onAddComment={handleAddComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
      />

    </div>
  );
};
