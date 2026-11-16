import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { ComicResponse, GenreResponse } from '../types';
import { comicService } from '../services/comicService';
import { genreService } from '../services/genreService';
import { ComicCard } from '../components/ComicCard';
import { Pagination } from '../components/Pagination';
import { getImageUrl } from '../services/apiClient';
import {
  Flame,
  Star,
  Clock,
  BookOpen,
  Layers,
  X,
  ChevronRight,
  ChevronLeft,
  Eye,
  Trophy,
  Sparkles,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [comics, setComics] = useState<ComicResponse[]>([]);
  const [trendingComics, setTrendingComics] = useState<ComicResponse[]>([]);
  const [topRatedComics, setTopRatedComics] = useState<ComicResponse[]>([]);
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  
  // Hero slider active index
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || searchParams.get('q') || '';
  const currentGenreSlug = searchParams.get('genre') || 'ALL';
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'rating'>('newest');

  // Load initial meta lists: Trending & Top Rated & Genres
  useEffect(() => {
    fetchGenres();
    fetchTrendingAndTopRated();
  }, []);

  // Auto rotate hero banner
  useEffect(() => {
    if (trendingComics.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % trendingComics.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [trendingComics.length]);

  useEffect(() => {
    fetchComics(page, currentGenreSlug, searchQuery, statusFilter, sortBy);
  }, [page, currentGenreSlug, searchQuery, statusFilter, sortBy]);

  const fetchGenres = async () => {
    try {
      const data = await genreService.getAllGenres();
      setGenres(data || []);
    } catch (err) {
      console.error('Không thể tải danh sách thể loại:', err);
    }
  };

  const fetchTrendingAndTopRated = async () => {
    try {
      // 5 Trending comics by views
      const trendingData = await comicService.getAllComics({
        page: 0,
        size: 5,
        sortBy: 'views',
        sortDir: 'desc',
      });
      setTrendingComics(trendingData.content || []);

      // 10 Top rated comics
      const topRatedData = await comicService.getAllComics({
        page: 0,
        size: 10,
        sortBy: 'rating',
        sortDir: 'desc',
      });
      setTopRatedComics(topRatedData.content || []);
    } catch (err) {
      console.error('Error fetching trending or top rated comics:', err);
    }
  };

  const fetchComics = async (
    pageNumber: number,
    genreSlug: string,
    query: string,
    status: string,
    sort: 'newest' | 'views' | 'rating'
  ) => {
    try {
      setLoading(true);
      setError('');
      const data = await comicService.getAllComics({
        page: pageNumber,
        size: pageSize,
        genre: genreSlug !== 'ALL' ? genreSlug : undefined,
        query: query.trim() || undefined,
        status: status !== 'ALL' ? (status as any) : undefined,
        sortBy: sort,
      });
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
    window.scrollTo({ top: 500, behavior: 'smooth' });
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

  const handleStatusChange = (status: string) => {
    setPage(0);
    setStatusFilter(status);
  };

  const handleSortChange = (sort: 'newest' | 'views' | 'rating') => {
    setPage(0);
    setSortBy(sort);
  };

  const currentHeroComic = trendingComics[activeHeroIndex] || trendingComics[0];
  const selectedGenreObj = genres.find((g) => g.slug === currentGenreSlug);

  return (
    <div className="py-6 space-y-8 animate-fade-in">
      
      {/* Hero Banner: 5 Trending Comics Slider */}
      {trendingComics.length > 0 && currentHeroComic && (
        <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-[#141721] soft-shadow">
          {/* Blurred Backdrop Cover */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={getImageUrl(currentHeroComic.coverImage)}
              alt={currentHeroComic.title}
              className="w-full h-full object-cover blur-2xl scale-125 opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e1017] via-[#0e1017]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141721] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-stretch gap-6 sm:gap-8 min-h-[380px]">
            {/* Poster Preview */}
            <div className="w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-[#090a0f] relative group">
              <img
                src={getImageUrl(currentHeroComic.coverImage)}
                alt={currentHeroComic.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-orange-500/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md flex items-center gap-1">
                <Flame className="w-3 h-3 fill-white" /> Top #{activeHeroIndex + 1} Thịnh Hành
              </div>
            </div>

            {/* Info details */}
            <div className="flex-1 flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[11px] font-bold">
                    <Sparkles className="w-3 h-3" /> Nổi bật nhất tuần
                  </span>
                  {currentHeroComic.genres && currentHeroComic.genres.slice(0, 3).map((g) => (
                    <span key={g.id} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-zinc-300 text-[10px] font-medium">
                      {g.name}
                    </span>
                  ))}
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight line-clamp-2">
                  {currentHeroComic.title}
                </h2>

                <p className="text-xs sm:text-sm text-zinc-400 line-clamp-3 leading-relaxed max-w-2xl">
                  {currentHeroComic.description || 'HComic - Nền tảng đọc truyện tranh sắc nét, cập nhật liên tục với độ phân giải cao và giao diện đọc tối ưu.'}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-300 pt-1">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Eye className="w-4 h-4 text-zinc-500" />
                    {currentHeroComic.viewCount?.toLocaleString() || 0} lượt xem
                  </span>
                  {currentHeroComic.rating && currentHeroComic.rating > 0 && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {currentHeroComic.rating.toFixed(1)} / 5.0
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons & Slider dots */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/comic/${currentHeroComic.slug}`}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 hover:scale-105"
                  >
                    <BookOpen className="w-4 h-4" /> Đọc Ngay
                  </Link>
                  <Link
                    to={`/comic/${currentHeroComic.slug}`}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-bold text-xs transition-all"
                  >
                    Thông Tin Chi Tiết
                  </Link>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setActiveHeroIndex((prev) => (prev - 1 + trendingComics.length) % trendingComics.length)
                    }
                    className="p-2 rounded-xl bg-black/40 hover:bg-orange-500 text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
                    title="Truyện trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5 px-2">
                    {trendingComics.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveHeroIndex(i)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          i === activeHeroIndex ? 'w-6 bg-orange-500' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveHeroIndex((prev) => (prev + 1) % trendingComics.length)}
                    className="p-2 rounded-xl bg-black/40 hover:bg-orange-500 text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
                    title="Truyện tiếp theo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Genre Filter Carousel / Chips */}
      {genres.length > 0 && (
        <div className="bg-[#141721] rounded-2xl p-4 border border-white/5 soft-shadow space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
              <Layers className="w-4 h-4 text-orange-400" />
              <span>Khám phá theo Thể loại:</span>
            </div>
            {currentGenreSlug !== 'ALL' && (
              <button
                onClick={() => handleSelectGenre('ALL')}
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" /> Đặt lại tất cả thể loại
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
            <button
              onClick={() => handleSelectGenre('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                currentGenreSlug === 'ALL'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-[#090a0f] text-zinc-400 hover:text-white border border-white/5'
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
      )}

      {/* Main Content Grid: Left comics list + Right Top Rating Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column (3/4): New updates & filters */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Filter & Sort Toolbar */}
          <div className="bg-[#141721] rounded-2xl p-4 border border-white/5 soft-shadow flex flex-wrap items-center justify-between gap-4">
            
            {/* Status Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-zinc-400 mr-2 flex items-center gap-1">
                Lọc:
              </span>
              {[
                { key: 'ALL', label: 'Tất cả' },
                { key: 'ONGOING', label: 'Đang tiến hành' },
                { key: 'COMPLETED', label: 'Hoàn thành' },
                { key: 'PAUSED', label: 'Tạm ngưng' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleStatusChange(item.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    statusFilter === item.key
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                      : 'bg-[#090a0f] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400">Sắp xếp:</span>
              <div className="flex bg-[#090a0f] p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => handleSortChange('newest')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    sortBy === 'newest'
                      ? 'bg-[#141721] text-orange-400 font-bold border border-white/5 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Clock className="w-3 h-3" /> Mới nhất
                </button>
                <button
                  onClick={() => handleSortChange('views')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    sortBy === 'views'
                      ? 'bg-[#141721] text-orange-400 font-bold border border-white/5 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Flame className="w-3 h-3" /> Xem nhiều
                </button>
                <button
                  onClick={() => handleSortChange('rating')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    sortBy === 'rating'
                      ? 'bg-[#141721] text-orange-400 font-bold border border-white/5 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Star className="w-3 h-3" /> Đánh giá cao
                </button>
              </div>
            </div>

          </div>

          {/* Active Filter Info */}
          {(searchQuery || currentGenreSlug !== 'ALL') && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300 bg-orange-950/20 border border-orange-500/20 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <span>Đang hiển thị kết quả ({totalElements} truyện):</span>
                {currentGenreSlug !== 'ALL' && selectedGenreObj && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500 text-white font-bold">
                    Thể loại: {selectedGenreObj.name}
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 font-semibold border border-white/5">
                    Từ khóa: "{searchQuery}"
                  </span>
                )}
              </div>
              <button
                onClick={() => setSearchParams({})}
                className="text-orange-400 font-bold hover:underline cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}

          {/* Comics Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[#141721] rounded-2xl aspect-[3/4] animate-pulse border border-white/5" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-950/30 border border-red-500/20 rounded-2xl text-red-300 text-sm">
              {error}
            </div>
          ) : comics.length === 0 ? (
            <div className="p-12 text-center bg-[#141721] rounded-2xl border border-white/5 soft-shadow space-y-3">
              <BookOpen className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Không tìm thấy truyện nào</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Thử thay đổi thể loại hoặc từ khóa tìm kiếm để khám phá các bộ truyện khác.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {comics.map((comic) => (
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

        {/* Right Column (1/4): Top Rated Leaderboard */}
        <div className="space-y-4">
          <div className="bg-[#141721] rounded-2xl p-4 border border-white/5 soft-shadow space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Bảng Xếp Hạng Đánh Giá
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Top 10
              </span>
            </div>

            {topRatedComics.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">Đang cập nhật bảng xếp hạng...</p>
            ) : (
              <div className="space-y-2.5">
                {topRatedComics.map((item, index) => {
                  const rank = index + 1;
                  const rankBadgeClass =
                    rank === 1
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : rank === 2
                      ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/30'
                      : rank === 3
                      ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30'
                      : 'bg-zinc-800/80 text-zinc-500 border border-white/5';

                  return (
                    <Link
                      key={item.id}
                      to={`/comic/${item.slug}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      {/* Rank Number */}
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${rankBadgeClass}`}
                      >
                        {rank}
                      </span>

                      {/* Poster Thumb */}
                      <img
                        src={getImageUrl(item.coverImage)}
                        alt={item.title}
                        className="w-10 h-13 object-cover rounded-lg border border-white/5 shrink-0 bg-[#090a0f]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop';
                        }}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-zinc-200 group-hover:text-orange-400 truncate transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {item.rating && item.rating > 0 ? (
                            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              {item.rating.toFixed(1)}
                            </span>
                          ) : null}
                          <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                            <Eye className="w-2.5 h-2.5 text-zinc-600" />
                            {item.viewCount?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="pt-2 border-t border-white/5">
              <Link
                to="/search?sort=rating"
                className="w-full py-2 px-3 text-center text-xs font-bold text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 rounded-xl transition-colors block"
              >
                Xem Toàn Bộ Bảng Xếp Hạng
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
