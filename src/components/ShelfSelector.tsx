import React, { useState, useEffect, useRef } from 'react';
import type { ShelfStatus, UserComicLibraryResponse } from '../types';
import { libraryService } from '../services/libraryService';
import { useAuth } from '../context/AuthContext';
import { Bookmark, Heart, BookCheck, Clock, BookmarkCheck, ChevronDown } from 'lucide-react';

interface ShelfSelectorProps {
  comicId: number;
  onStatusChange?: (newStatus: ShelfStatus | null) => void;
}

const SHELF_OPTIONS: { status: ShelfStatus; label: string; icon: React.FC<{ className?: string }>; colorClass: string }[] = [
  { status: 'READING', label: 'Đang Đọc', icon: Bookmark, colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { status: 'FAVORITE', label: 'Yêu Thích', icon: Heart, colorClass: 'text-rose-600 bg-rose-50 border-rose-200' },
  { status: 'COMPLETED', label: 'Đã Đọc Xong', icon: BookCheck, colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { status: 'READ_LATER', label: 'Đọc Sau', icon: Clock, colorClass: 'text-amber-600 bg-amber-50 border-amber-200' },
];

export const ShelfSelector: React.FC<ShelfSelectorProps> = ({ comicId, onStatusChange }) => {
  const { isAuthenticated } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<ShelfStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && comicId) {
      fetchShelfStatus();
    }
  }, [isAuthenticated, comicId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchShelfStatus = async () => {
    try {
      const res: UserComicLibraryResponse | null = await libraryService.getComicLibraryStatus(comicId);
      if (res) {
        setCurrentStatus(res.status);
      } else {
        setCurrentStatus(null);
      }
    } catch {
      setCurrentStatus(null);
    }
  };

  const handleSelectStatus = async (status: ShelfStatus | null) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để lưu truyện vào Tủ sách cá nhân!');
      return;
    }
    try {
      setLoading(true);
      const newStatusToSet = currentStatus === status ? null : status;
      const res = await libraryService.updateLibraryStatus(comicId, newStatusToSet);
      setCurrentStatus(res ? res.status : null);
      if (onStatusChange) {
        onStatusChange(res ? res.status : null);
      }
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật Tủ sách');
    } finally {
      setLoading(false);
    }
  };

  const activeOption = SHELF_OPTIONS.find((opt) => opt.status === currentStatus);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${
          activeOption
            ? activeOption.colorClass
            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
        }`}
      >
        {activeOption ? (
          <>
            <BookmarkCheck className="w-4 h-4" />
            <span>Tủ Sách: {activeOption.label}</span>
          </>
        ) : (
          <>
            <Bookmark className="w-4 h-4 text-slate-500" />
            <span>+ Thêm Vào Tủ Sách</span>
          </>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-fade-in space-y-1">
          <div className="px-3 py-1.5 border-b border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Phân loại Tủ Sách
            </p>
          </div>

          {SHELF_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = currentStatus === opt.status;

            return (
              <button
                key={opt.status}
                onClick={() => handleSelectStatus(opt.status)}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                  isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold">✓</span>}
              </button>
            );
          })}

          {currentStatus && (
            <div className="pt-1 border-t border-slate-100">
              <button
                onClick={() => handleSelectStatus(null)}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Gỡ khỏi Tủ Sách
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
