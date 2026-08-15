import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { ComicResponse, GenreResponse } from '../types';
import { comicService } from '../services/comicService';
import { genreService } from '../services/genreService';
import { ComicCard } from '../components/ComicCard';
import { Pagination } from '../components/Pagination';
import { Filter, Sparkles, PlusCircle, Flame, Star, Clock, BookOpen, Layers, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const [comics, setComics] = useState<ComicResponse[]>([]);
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasRole } = useAuth();

  const searchQuery = searchParams.get('search') || '';
  const currentGenreSlug = searchParams.get('genre') || 'ALL';
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'rating'>('newest');

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchComics(page, currentGenreSlug);
  }, [page, currentGenreSlug]);

  const fetchGenres = async () => {
    try {
      const data = await genreService.getAllGenres();
      setGenres(data || []);
    } catch (err) {
      console.error('Không thể tải danh sách thể loại:', err);
    }
  };

  const fetchComics = async (pageNumber: number, genreSlug: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await comicService.getAllComics(pageNumber, pageSize, genreSlug);
      setComics(data.content || []);
      setPage(data.page || 0);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách truyện');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSelectGenre = (slug: string) => {
    setPage(0);
    const newParams = new URLSearchParams(searchParams);
    if (slug === 'ALL') {
      newParams.delete('genre');
    } else {
      newParams.set('genre', slug);
    }
    setSearchParams(newParams);
  };

  const selectedGenreObj = genres.find((g) => g.slug === currentGenreSlug);

  const filteredComics = comics.filter((comic) => {
    const matchesSearch =
      searchQuery === '' ||
      comic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comic.author && comic.author.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || comic.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'views') {
      return (b.viewCount || 0) - (a.viewCount || 0);
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const isTranslatorOrAdmin = hasRole(['TRANSLATOR', 'ADMIN']);

  return (
    <div className="py-8 space-y-8 animate-fade-in">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-teal-500 text-white p-8 sm:p-10 shadow-xl shadow-indigo-100/60">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white border border-white/30">
            <Sparkles className="w-3.5 h-3.5" /> Thư Viện Truyện Tranh Độc Quyền
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Khám phá thế giới câu chuyện hấp dẫn và phong phú
          </h1>
          <p className="text-sm text-indigo-100 leading-relaxed font-normal">
            Trải nghiệm đọc truyện mượt mà với giao diện dịu mắt, cập nhật chương mới nhanh nhất cùng cộng đồng mê truyện đông đảo.
          </p>

          {isTranslatorOrAdmin && (
            <div className="pt-2">
              <Link
                to="/my-comics"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-lg shadow-black/5 transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4" /> Đăng Truyện Mới Ngay
              </Link>
            </div>
          )}
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      </div>

      {/* Genre Filter Carousel / Chips */}
      {genres.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 soft-shadow space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Khám phá theo Thể loại:</span>
            </div>
            {currentGenreSlug !== 'ALL' && (
              <button
                onClick={() => handleSelectGenre('ALL')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Đặt lại tất cả thể loại
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
            <button
              onClick={() => handleSelectGenre('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                currentGenreSlug === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              Tất cả
            </button>
            {genres.map((genre) => {
              const isSelected = currentGenreSlug === genre.slug;
              return (
                <button
                  key={genre.id}
                  onClick={() => handleSelectGenre(genre.slug)}
                  title={genre.description || genre.name}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-transparent hover:border-indigo-100'
                  }`}
                >
                  <span>{genre.name}</span>
                  {genre.comicCount !== undefined && genre.comicCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {genre.comicCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 soft-shadow flex flex-wrap items-center justify-between gap-4">
        
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc:
          </span>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'ONGOING', label: 'Đang tiến hành' },
            { key: 'COMPLETED', label: 'Hoàn thành' },
            { key: 'PAUSED', label: 'Tạm ngưng' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                statusFilter === item.key
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Sắp xếp:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setSortBy('newest')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'newest' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-600'
              }`}
            >
              <Clock className="w-3 h-3" /> Mới nhất
            </button>
            <button
              onClick={() => setSortBy('views')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'views' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-600'
              }`}
            >
              <Flame className="w-3 h-3" /> Xem nhiều
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'rating' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-600'
              }`}
            >
              <Star className="w-3 h-3" /> Đánh giá cao
            </button>
          </div>
        </div>

      </div>

      {/* Search & Active Genre Info */}
      {(searchQuery || currentGenreSlug !== 'ALL') && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <span>Đang hiển thị kết quả cho:</span>
            {currentGenreSlug !== 'ALL' && selectedGenreObj && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold">
                Thể loại: {selectedGenreObj.name}
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-semibold">
                Từ khóa: "{searchQuery}"
              </span>
            )}
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}

      {/* Comics Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl aspect-[3/4] animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          {error}
        </div>
      ) : filteredComics.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 soft-shadow space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy truyện nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Thử thay đổi thể loại, từ khóa tìm kiếm hoặc bỏ bớt bộ lọc để khám phá các bộ truyện khác.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredComics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>

          {/* Pagination Component */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}

    </div>
  );
};
