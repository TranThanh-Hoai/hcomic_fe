import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ComicResponse, GenreResponse, ComicStatus } from '../types';
import { comicService } from '../services/comicService';
import { genreService } from '../services/genreService';
import { ComicCard } from '../components/ComicCard';
import { Pagination } from '../components/Pagination';
import {
  Search,
  Layers,
  Filter,
  ArrowUpDown,
  X,
  BookOpen,
  RotateCcw,
  Compass,
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const urlQuery = searchParams.get('q') || searchParams.get('query') || '';
  const urlGenre = searchParams.get('genre') || 'ALL';
  const urlStatus = (searchParams.get('status') as ComicStatus | 'ALL') || 'ALL';
  const urlSort = (searchParams.get('sort') as 'newest' | 'views' | 'rating' | 'title') || 'newest';
  const urlPage = parseInt(searchParams.get('page') || '0', 10);

  // Local form input state
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [comics, setComics] = useState<ComicResponse[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(urlPage);
  const [pageSize] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isGenresExpanded, setIsGenresExpanded] = useState<boolean>(false);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  // Load genres list
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await genreService.getAllGenres();
        setGenres(data || []);
      } catch (err) {
        console.error('Không thể tải danh sách thể loại:', err);
      }
    };
    fetchGenres();
  }, []);

  // Fetch comics on filter or page change
  useEffect(() => {
    const fetchComics = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await comicService.getAllComics({
          query: urlQuery || undefined,
          genre: urlGenre !== 'ALL' ? urlGenre : undefined,
          status: urlStatus !== 'ALL' ? urlStatus : undefined,
          sortBy: urlSort,
          page: urlPage,
          size: pageSize,
        });

        setComics(data.content || []);
        setCurrentPage(data.page || 0);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách truyện tìm kiếm');
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, [urlQuery, urlGenre, urlStatus, urlSort, urlPage, pageSize]);

  // Update URL helper
  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'ALL') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    // Reset page to 0 on any filter change unless page itself was updated
    if (!('page' in updates)) {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchInput.trim() || null });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateFilters({ q: null });
  };

  const handleSelectGenre = (slug: string) => {
    updateFilters({ genre: slug === urlGenre ? null : slug });
  };

  const handleSelectStatus = (status: string) => {
    updateFilters({ status: status === urlStatus ? null : status });
  };

  const handleSelectSort = (sort: 'newest' | 'views' | 'rating' | 'title') => {
    updateFilters({ sort: sort === 'newest' ? null : sort });
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage > 0 ? newPage.toString() : null });
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleResetAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const selectedGenreObj = genres.find((g) => g.slug === urlGenre);
  const hasActiveFilters = Boolean(urlQuery || urlGenre !== 'ALL' || urlStatus !== 'ALL' || urlSort !== 'newest');

  // Display genres limit
  const visibleGenres = isGenresExpanded ? genres : genres.slice(0, 16);

  return (
    <div className="py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-indigo-900/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md text-xs font-semibold text-indigo-300 border border-indigo-500/30">
            <Compass className="w-3.5 h-3.5 text-teal-300" />
            <span>Tìm Kiếm & Khám Phá Truyện Tranh</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Khám phá hàng ngàn bộ truyện theo tên & thể loại
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
            Tìm kiếm theo tên truyện, tác giả hoặc lọc chính xác theo thể loại yêu thích với hệ thống phân loại đa dạng.
          </p>

          {/* Big Search Form */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center gap-2 max-w-2xl">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Nhập tên truyện, tên tác giả..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-10 py-3 text-sm bg-white/10 hover:bg-white/15 focus:bg-white focus:text-slate-900 text-white placeholder-slate-400 rounded-2xl border border-white/20 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-inner backdrop-blur-sm"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />

              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-3 p-1 text-slate-400 hover:text-slate-200 rounded-full hover:bg-white/10 transition-colors"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Tìm Kiếm</span>
            </button>
          </form>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-400 via-teal-400 to-transparent" />
      </div>

      {/* Main Filter Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 soft-shadow space-y-6">
        
        {/* Genre Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Thể Loại Truyện:</span>
              {selectedGenreObj && (
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  Đang chọn: {selectedGenreObj.name}
                </span>
              )}
            </div>

            {genres.length > 16 && (
              <button
                onClick={() => setIsGenresExpanded((prev) => !prev)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {isGenresExpanded ? 'Thu gọn thể loại' : `Xem tất cả (${genres.length})`}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSelectGenre('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                urlGenre === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              Tất cả thể loại
            </button>

            {visibleGenres.map((genre) => {
              const isSelected = urlGenre === genre.slug;
              return (
                <button
                  key={genre.id}
                  onClick={() => handleSelectGenre(genre.slug)}
                  title={genre.description || genre.name}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                      : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/70 hover:border-indigo-200'
                  }`}
                >
                  <span>{genre.name}</span>
                  {genre.comicCount !== undefined && genre.comicCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-200/80 text-slate-600'
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

        <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-4">
          
          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Trạng thái:
            </span>
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'ONGOING', label: 'Đang tiến hành' },
              { key: 'COMPLETED', label: 'Hoàn thành' },
              { key: 'PAUSED', label: 'Tạm ngưng' },
            ].map((item) => {
              const isSelected = urlStatus === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleSelectStatus(item.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Sort Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sắp xếp:
            </span>
            {[
              { key: 'newest', label: 'Mới nhất' },
              { key: 'views', label: 'Xem nhiều nhất' },
              { key: 'rating', label: 'Đánh giá cao' },
              { key: 'title', label: 'Tên A-Z' },
            ].map((item) => {
              const isSelected = urlSort === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleSelectSort(item.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* Active Filter Chips & Results Count Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-200/80 soft-shadow">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700">
            Tìm thấy <strong className="text-indigo-600 font-extrabold">{totalElements}</strong> bộ truyện
          </span>

          {urlQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 font-medium">
              Từ khóa: "{urlQuery}"
              <button
                onClick={handleClearSearch}
                className="hover:text-rose-600 p-0.5"
                title="Bỏ từ khóa"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedGenreObj && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 font-medium">
              Thể loại: {selectedGenreObj.name}
              <button
                onClick={() => handleSelectGenre('ALL')}
                className="hover:text-rose-600 p-0.5"
                title="Bỏ thể loại"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {urlStatus !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-medium">
              Trạng thái: {urlStatus === 'ONGOING' ? 'Đang tiến hành' : urlStatus === 'COMPLETED' ? 'Hoàn thành' : 'Tạm ngưng'}
              <button
                onClick={() => handleSelectStatus('ALL')}
                className="hover:text-rose-600 p-0.5"
                title="Bỏ trạng thái"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleResetAllFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Đặt lại tất cả bộ lọc</span>
          </button>
        )}
      </div>

      {/* Comics Grid Content */}
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
      ) : comics.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 soft-shadow space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy bộ truyện nào phù hợp</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hãy thử tìm kiếm với từ khóa khác, bỏ bớt điều kiện lọc hoặc khám phá các thể loại phổ biến dưới đây.
            </p>
          </div>

          {/* Quick genre recommendation pills */}
          <div className="pt-2">
            <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Thể loại gợi ý
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {genres.slice(0, 8).map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleSelectGenre(genre.slug)}
                  className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleResetAllFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              Xem tất cả truyện
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {comics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            page={currentPage}
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
