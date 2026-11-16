import React, { useState, useEffect, useRef } from 'react';
import type { ShelfStatus, UserComicLibraryResponse } from '../types';
import { libraryService } from '../services/libraryService';
import { useAuth } from '../context/AuthContext';
import { Bookmark, Heart, BookCheck, Clock, BookmarkCheck, ChevronDown, Check } from 'lucide-react';

interface ShelfSelectorProps {
  comicId: number;
  onStatusChange?: (newStatus: ShelfStatus | null) => void;
}

const SHELF_OPTIONS: { status: ShelfStatus; label: string; icon: React.FC<{ className?: string }>; colorClass: string }[] = [
  { status: 'READING', label: 'Đang Đọc', icon: Bookmark, colorClass: 'text-orange-400 bg-orange-950/40 border-orange-500/30' },
  { status: 'FAVORITE', label: 'Yêu Thích', icon: Heart, colorClass: 'text-rose-400 bg-rose-950/40 border-rose-500/30' },
  { status: 'COMPLETED', label: 'Đã Đọc Xong', icon: BookCheck, colorClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' },
  { status: 'READ_LATER', label: 'Đọc Sau', icon: Clock, colorClass: 'text-amber-400 bg-amber-950/40 border-amber-500/30' },
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
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border cursor-pointer ${
          activeOption
            ? activeOption.colorClass
            : 'bg-[#141721] text-zinc-300 border-white/10 hover:border-orange-500/30 hover:text-white'
        }`}
      >
        {activeOption ? (
          <>
            <BookmarkCheck className="w-4 h-4" />
            <span>Tủ Sách: {activeOption.label}</span>
          </>
        ) : (
          <>
            <Bookmark className="w-4 h-4 text-zinc-400" />
            <span>+ Lưu Vào Tủ Sách</span>
          </>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-[#141721] rounded-2xl shadow-2xl border border-white/10 py-2 z-50 animate-fade-in space-y-1">
          <div className="px-3.5 py-1.5 border-b border-white/5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
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
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected ? 'bg-orange-500/15 text-orange-400 font-bold' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-orange-400' : 'text-zinc-500'}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-orange-400" />}
              </button>
            );
          })}

          {currentStatus && (
            <div className="pt-1 border-t border-white/5">
              <button
                onClick={() => handleSelectStatus(null)}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
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
