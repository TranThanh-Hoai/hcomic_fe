import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  page: number; // 0-indexed
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalElements,
  pageSize = 20,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const startItem = page * pageSize + 1;
  const endItem = totalElements ? Math.min((page + 1) * pageSize, totalElements) : (page + 1) * pageSize;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5 border-t border-white/5">
      {/* Item info */}
      <div className="text-xs text-zinc-400 font-medium">
        {totalElements !== undefined ? (
          <span>
            Hiển thị <strong className="text-white font-bold">{startItem} - {endItem}</strong> trên <strong className="text-orange-400 font-bold">{totalElements}</strong> kết quả
          </span>
        ) : (
          <span>
            Trang <strong className="text-white font-bold">{page + 1}</strong> / <strong className="text-zinc-400">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <button
          onClick={() => onPageChange(0)}
          disabled={page === 0}
          className="p-2 rounded-xl text-zinc-400 hover:text-orange-400 hover:bg-[#141721] border border-transparent hover:border-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors cursor-pointer"
          title="Trang đầu"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Prev Page */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="p-2 rounded-xl text-zinc-400 hover:text-orange-400 hover:bg-[#141721] border border-transparent hover:border-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors cursor-pointer"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {pageNumbers[0] > 0 && (
          <>
            <button
              onClick={() => onPageChange(0)}
              className="w-8 h-8 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-[#141721] border border-transparent hover:border-white/5 transition-colors cursor-pointer"
            >
              1
            </button>
            {pageNumbers[0] > 1 && <span className="px-1 text-zinc-600 text-xs">...</span>}
          </>
        )}

        {pageNumbers.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              p === page
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 border border-orange-400'
                : 'text-zinc-400 hover:text-white hover:bg-[#141721] border border-white/5'
            }`}
          >
            {p + 1}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
              <span className="px-1 text-zinc-600 text-xs">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages - 1)}
              className="w-8 h-8 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-[#141721] border border-white/5 transition-colors cursor-pointer"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="p-2 rounded-xl text-zinc-400 hover:text-orange-400 hover:bg-[#141721] border border-transparent hover:border-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors cursor-pointer"
          title="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
          className="p-2 rounded-xl text-zinc-400 hover:text-orange-400 hover:bg-[#141721] border border-transparent hover:border-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors cursor-pointer"
          title="Trang cuối"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
