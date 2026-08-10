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
} from 'lucide-react';
import { getImageUrl } from '../services/apiClient';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const isTranslatorOrAdmin = hasRole(['TRANSLATOR', 'ADMIN']);

  const currentDisplayName = user?.displayName || user?.username || 'User';

  return (
    <header className="sticky top-0 z-40 glass-nav shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-teal-400 p-0.5 shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
                HComic
              </span>
              <span className="text-[10px] font-medium text-slate-400 -mt-1">
                Thế Giới Truyện Tranh
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm tên truyện, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            </div>
          </form>

          {/* Actions & User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Link
                to="/library"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
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
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
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
                  className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100/80 transition-colors focus:outline-none group"
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

                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors max-w-[130px] truncate hidden md:inline">
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all"
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
