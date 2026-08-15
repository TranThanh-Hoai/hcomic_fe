import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  LogOut,
  PlusCircle,
  Search,
  ShieldCheck,
  Feather,
  User as UserIcon,
  ChevronDown,
  Bookmark,
  Compass,
  Star,
  Eye,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { getImageUrl } from '../services/apiClient';
import { comicService } from '../services/comicService';
import type { ComicResponse } from '../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [quickResults, setQuickResults] = useState<ComicResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync searchQuery with URL on /search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      setSearchQuery(params.get('q') || params.get('query') || '');
    }
  }, [location]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Quick Search
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setQuickResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await comicService.quickSearch(query, 5);
        setQuickResults(results);
      } catch (err) {
        console.error('Quick search error:', err);
        setQuickResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(false);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setQuickResults([]);
    setIsSearchOpen(false);
  };

  const isTranslatorOrAdmin = hasRole(['TRANSLATOR', 'ADMIN']);
  const currentDisplayName = user?.displayName || user?.username || 'User';

  return (
    <header className="sticky top-0 z-40 glass-nav shadow-sm bg-white/85 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-teal-400 p-0.5 shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
                  HComic
                </span>
                <span className="text-[10px] font-medium text-slate-400 -mt-1 hidden sm:inline">
                  Thế Giới Truyện Tranh
                </span>
              </div>
            </Link>

            {/* Quick Explore Link */}
            <Link
              to="/search"
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/search'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Khám Phá & Thể Loại</span>
            </Link>
          </div>

          {/* Search Bar with Live Preview Dropdown */}
          <div className="flex-1 max-w-md relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Tìm tên truyện, tác giả..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-100/90 hover:bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all text-slate-800 placeholder-slate-400 shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 sm:top-2.5 pointer-events-none" />

              {searchQuery ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </form>

            {/* Live Search Preview Dropdown */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-fade-in divide-y divide-slate-100">
                
                {/* Header info */}
                <div className="px-4 py-2.5 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold flex items-center gap-1.5">
                    {isSearching ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>Đang tìm kiếm...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Gợi ý cho "{searchQuery}"</span>
                      </>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {quickResults.length} kết quả
                  </span>
                </div>

                {/* Results List */}
                {isSearching && quickResults.length === 0 ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-14 bg-slate-200 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="w-3/4 h-3 bg-slate-200 rounded" />
                          <div className="w-1/2 h-2.5 bg-slate-100 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : quickResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {quickResults.map((comic) => (
                      <Link
                        key={comic.id}
                        to={`/comic/${comic.slug}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 p-3 hover:bg-indigo-50/70 transition-colors group"
                      >
                        <img
                          src={getImageUrl(comic.coverImage)}
                          alt={comic.title}
                          className="w-10 h-14 object-cover rounded-lg shadow-sm border border-slate-200 shrink-0 bg-slate-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate transition-colors">
                            {comic.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {comic.author || comic.uploader || 'Chưa cập nhật tác giả'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {comic.genres && comic.genres.length > 0 && (
                              <span className="px-1.5 py-0.2 bg-indigo-100/80 text-indigo-700 rounded text-[9px] font-semibold">
                                {comic.genres[0].name}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                              <Eye className="w-2.5 h-2.5 text-slate-400" />
                              {comic.viewCount?.toLocaleString() || 0}
                            </span>
                            {comic.rating && comic.rating > 0 ? (
                              <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                {comic.rating.toFixed(1)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700">Không tìm thấy kết quả nhanh</p>
                    <p className="text-[11px] text-slate-400">
                      Bấm Enter hoặc xem trang Tìm Kiếm để lọc nâng cao hơn
                    </p>
                  </div>
                )}

                {/* Footer Action */}
                <div className="p-2.5 bg-slate-50 text-center">
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Xem tất cả kết quả trên trang Tìm Kiếm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Actions & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Explore button */}
            <Link
              to="/search"
              className="md:hidden p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl"
              title="Khám phá thể loại"
            >
              <Compass className="w-5 h-5" />
            </Link>

            {isAuthenticated && (
              <Link
                to="/library"
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  location.pathname === '/library'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Tủ Sách</span>
              </Link>
            )}

            {isTranslatorOrAdmin && (
              <Link
                to="/my-comics"
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  location.pathname === '/my-comics'
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-200'
                    : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Quản Lý Đăng Truyện</span>
              </Link>
            )}

            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                
                {/* Circular Avatar & Display Name Button */}
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100/80 transition-colors focus:outline-none group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-400 p-0.5 shadow-sm shadow-indigo-100 group-hover:scale-105 transition-transform shrink-0">
                    {user.avatar ? (
                      <img
                        src={getImageUrl(user.avatar)}
                        alt={currentDisplayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-indigo-600 font-extrabold text-xs">
                        {currentDisplayName[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors max-w-[120px] truncate hidden md:inline">
                    {currentDisplayName}
                  </span>

                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-fade-in divide-y divide-slate-100">
                    
                    {/* User Header Summary */}
                    <div className="px-4 py-2.5 space-y-1">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {currentDisplayName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">
                        @{user.username}
                      </p>
                      <div className="pt-1">
                        {user.role === 'ADMIN' && (
                          <span className="inline-flex items-center gap-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                            <ShieldCheck className="w-3 h-3" /> ADMIN
                          </span>
                        )}
                        {user.role === 'TRANSLATOR' && (
                          <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                            <Feather className="w-3 h-3" /> DỊCH GIẢ
                          </span>
                        )}
                        {user.role === 'USER' && (
                          <span className="inline-flex items-center gap-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                            ĐỘC GIẢ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Menu Options */}
                    <div className="py-1">
                      <Link
                        to="/library"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-indigo-500" />
                        <span>Tủ sách cá nhân</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-indigo-500" />
                        <span>Thông tin cá nhân</span>
                      </Link>

                      {isTranslatorOrAdmin && (
                        <Link
                          to="/my-comics"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-teal-500" />
                          <span>Quản lý đăng truyện</span>
                        </Link>
                      )}

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 flex items-center gap-2.5 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span>Trang Quản Trị (Admin)</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout Option */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all"
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
