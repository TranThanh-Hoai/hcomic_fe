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
  X,
  BookOpen,
  RotateCcw,
  Compass,
  Clock,
  Flame,
  Star,
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
  const visibleGenres = isGenresExpanded ? genres : genres.slice(0, 16);

  return (
    <div className="py-6 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#141721] text-white p-6 sm:p-10 shadow-2xl border border-white/5">
        <div className="relative z-10 max-w-3xl space-y-4 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>Tìm Kiếm & Khám Phá Nâng Cao</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Khám phá kho truyện tranh và manga phong phú
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Tra cứu theo tên truyện, tác giả, trạng thái phát hành hoặc kết hợp đa dạng các thể loại.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center gap-2 max-w-2xl">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Nhập tên truyện, tên tác giả..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-10 py-3 text-xs sm:text-sm bg-[#090a0f] text-white placeholder-zinc-500 rounded-2xl border border-white/10 focus:border-orange-500/60 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />

              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-3 p-1 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Tìm Kiếm</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main Filter Section */}
      <div className="bg-[#141721] rounded-3xl p-5 sm:p-6 border border-white/5 soft-shadow space-y-6">
        
        {/* Genre Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <Layers className="w-4 h-4 text-orange-400" />
              <span>Thể Loại Truyện:</span>
              {selectedGenreObj && (
                <span className="text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                  Đang chọn: {selectedGenreObj.name}
                </span>
              )}
            </div>

            {genres.length > 16 && (
              <button
                onClick={() => setIsGenresExpanded((prev) => !prev)}
                className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
              >
                {isGenresExpanded ? 'Thu gọn thể loại' : `Xem tất cả (${genres.length})`}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSelectGenre('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                urlGenre === 'ALL'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-[#090a0f] text-zinc-400 hover:text-white border border-white/5'
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-bold border border-orange-400'
                      : 'bg-[#090a0f] text-zinc-300 hover:text-orange-400 hover:border-orange-500/30 border border-white/5'
                  }`}
                >
                  <span>{genre.name}</span>
                  {genre.comicCount !== undefined && genre.comicCount > 0 && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-zinc-800 text-zinc-400'
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

        <div className="border-t border-white/5 pt-4 flex flex-wrap items-center justify-between gap-4">
          
          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 mr-1 flex items-center gap-1">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                      : 'bg-[#090a0f] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Sort Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-zinc-400">Sắp xếp:</span>
            <div className="flex bg-[#090a0f] p-1 rounded-xl border border-white/5">
              {[
                { key: 'newest', label: 'Mới nhất', icon: Clock },
                { key: 'views', label: 'Lượt xem', icon: Flame },
                { key: 'rating', label: 'Đánh giá', icon: Star },
                { key: 'title', label: 'Tên A-Z', icon: null },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleSelectSort(item.key as any)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    urlSort === item.key
                      ? 'bg-[#141721] text-orange-400 font-bold border border-white/5 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {item.icon && <item.icon className="w-3 h-3" />}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-orange-950/20 border border-orange-500/20 p-3 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-400">Đang lọc theo:</span>
            {urlQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 font-semibold border border-white/5">
                Từ khóa: "{urlQuery}"
              </span>
            )}
            {selectedGenreObj && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500 text-white font-bold">
                {selectedGenreObj.name}
              </span>
            )}
            {urlStatus !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 font-semibold border border-white/5">
                {urlStatus === 'ONGOING' ? 'Đang tiến hành' : urlStatus === 'COMPLETED' ? 'Hoàn thành' : 'Tạm ngưng'}
              </span>
            )}
            {urlSort !== 'newest' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 font-semibold border border-white/5">
                Ưu tiên: {urlSort === 'views' ? 'Xem nhiều' : urlSort === 'rating' ? 'Đánh giá' : 'Tên'}
              </span>
            )}
          </div>

          <button
            onClick={handleResetAllFilters}
            className="flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Đặt lại tất cả
          </button>
        </div>
      )}

      {/* Comics Grid Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-[#141721] rounded-2xl aspect-[3/4] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-950/30 border border-red-500/20 rounded-2xl text-red-300 text-sm">
          {error}
        </div>
      ) : comics.length === 0 ? (
        <div className="p-16 text-center bg-[#141721] rounded-3xl border border-white/5 soft-shadow space-y-4">
          <BookOpen className="w-14 h-14 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Không tìm thấy truyện nào phù hợp</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Không tìm thấy truyện nào với tiêu chí lọc hiện tại. Hãy thử thay đổi từ khóa hoặc đặt lại bộ lọc.
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetAllFilters}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
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

          {/* Pagination Component */}
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
