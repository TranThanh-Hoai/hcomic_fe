import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { ComicResponse, ComicRequestData } from '../types';
import { comicService } from '../services/comicService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ComicModal } from '../components/ComicModal';
import { Pagination } from '../components/Pagination';
import { getImageUrl } from '../services/apiClient';
import { PlusCircle, Edit, Trash2, BookOpen, Eye, Heart, ShieldAlert, Sparkles } from 'lucide-react';

export const MyComicsPage: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();

  const [comics, setComics] = useState<ComicResponse[]>([]);
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingComic, setEditingComic] = useState<ComicResponse | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !hasRole(['TRANSLATOR', 'ADMIN'])) {
      return;
    }
    fetchMyComics(page);
  }, [isAuthenticated, page]);

  const fetchMyComics = async (pageNumber: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await comicService.getMyComics(pageNumber, pageSize);
      setComics(data.content || []);
      setPage(data.page || 0);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách truyện của bạn');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleOpenAddModal = () => {
    setEditingComic(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comic: ComicResponse) => {
    setEditingComic(comic);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (data: ComicRequestData, coverFile: File | null) => {
    if (editingComic) {
      const updated = await comicService.updateComic(editingComic.id, data, coverFile);
      setComics((prev) => prev.map((c) => (c.id === editingComic.id ? updated : c)));
    } else {
      const created = await comicService.createComic(data, coverFile);
      setComics((prev) => [created, ...prev]);
      setTotalElements((prev) => prev + 1);
    }
  };

  const handleDeleteComic = async (id: number, title: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa truyện "${title}"?`)) {
      try {
        await comicService.deleteComic(id);
        setComics((prev) => prev.filter((c) => c.id !== id));
        setTotalElements((prev) => Math.max(0, prev - 1));
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa truyện');
      }
    }
  };

  if (!isAuthenticated || !hasRole(['TRANSLATOR', 'ADMIN'])) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4 px-4">
        <div className="p-8 bg-[#141721] border border-white/5 rounded-3xl text-zinc-300 space-y-3 soft-shadow">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Quyền Truy Cập Bị Từ Chối</h3>
          <p className="text-xs text-zinc-400">
            Trang này chỉ dành cho người dùng có quyền <strong>DỊCH GIẢ</strong> (TRANSLATOR) hoặc <strong>ADMIN</strong>.
          </p>
          <div className="pt-2">
            <Link to="/" className="inline-block px-5 py-2.5 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md">
              ← Trở về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8 animate-fade-in text-left">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Người Dịch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Quản Lý Truyện Của Tôi
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Đăng truyện mới, quản lý chapter, tải hàng loạt tranh ảnh và theo dõi thông số tác phẩm.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Đăng Truyện Mới</span>
        </button>
      </div>

      {/* Comics List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-[#141721] rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-950/30 border border-red-500/20 rounded-2xl text-red-300 text-sm">
          {error}
        </div>
      ) : comics.length === 0 ? (
        <div className="p-16 text-center bg-[#141721] rounded-3xl border border-white/5 soft-shadow space-y-3">
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Bạn chưa đăng tải bộ truyện nào</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Bấm "Đăng Truyện Mới" để bắt đầu chia sẻ câu chuyện đầu tiên của bạn đến cộng đồng HComic!
          </p>
          <div className="pt-2">
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Đăng Truyện Ngay
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {comics.map((comic) => (
              <div
                key={comic.id}
                className="group bg-[#141721] rounded-2xl p-3 border border-white/5 hover:border-orange-500/30 transition-all flex gap-3 soft-shadow relative"
              >
                {/* Poster */}
                <Link
                  to={`/comic/${comic.slug}`}
                  className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-[#090a0f] border border-white/5 shrink-0 block"
                >
                  <img
                    src={getImageUrl(comic.coverImage)}
                    alt={comic.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop';
                    }}
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      to={`/comic/${comic.slug}`}
                      className="text-xs font-bold text-white hover:text-orange-400 truncate block transition-colors"
                      title={comic.title}
                    >
                      {comic.title}
                    </Link>

                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {comic.author || 'Tác giả chưa rõ'}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      <StatusBadge status={comic.status} />
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-semibold mt-2">
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3 text-zinc-600" />
                        {comic.viewCount?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center gap-0.5 text-rose-400">
                        <Heart className="w-3 h-3 fill-rose-500" />
                        {comic.likeCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-white/5">
                    <Link
                      to={`/comic/${comic.slug}`}
                      className="text-[11px] font-bold text-orange-400 hover:text-orange-300"
                    >
                      Quản lý Chapters →
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(comic)}
                        className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        title="Sửa thông tin"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteComic(comic.id, comic.title)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-red-950/20 transition-colors cursor-pointer"
                        title="Xóa truyện"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ComicModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitModal}
          initialData={editingComic}
        />
      )}

    </div>
  );
};
