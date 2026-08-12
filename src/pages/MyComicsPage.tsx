import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { ComicResponse, ComicRequestData } from '../types';
import { comicService } from '../services/comicService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ComicModal } from '../components/ComicModal';
import { Pagination } from '../components/Pagination';
import { getImageUrl } from '../services/apiClient';
import { PlusCircle, Edit, Trash2, BookOpen, Eye, Heart, ShieldAlert } from 'lucide-react';

export const MyComicsPage: React.FC = () => {
  const { user, isAuthenticated, hasRole } = useAuth();

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
      <div className="py-12 max-w-md mx-auto text-center space-y-4">
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 space-y-2">
          <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
          <h3 className="text-base font-bold">Quyền truy cập bị từ chối</h3>
          <p className="text-xs">
            Trang này chỉ dành cho người dùng có quyền <strong>DỊCH GIẢ</strong> (TRANSLATOR) hoặc <strong>ADMIN</strong>.
          </p>
        </div>
        <Link to="/" className="inline-block text-xs font-bold text-indigo-600 hover:underline">
          ← Trở về Trang Chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6 animate-fade-in max-w-6xl mx-auto">
      
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Quản Lý Đăng Truyện
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách các bộ truyện được cập nhật bởi <strong className="text-indigo-600">{user?.username}</strong>
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200"
        >
          <PlusCircle className="w-4 h-4" /> Đăng Truyện Mới
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white h-20 rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs text-center">
          {error}
        </div>
      ) : comics.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 soft-shadow space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Chưa có bộ truyện nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Bạn chưa đăng bộ truyện nào. Hãy ấn nút bên dưới để tạo bộ truyện đầu tiên!
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Tạo Truyện Mới
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 soft-shadow overflow-hidden p-4 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Bìa</th>
                  <th className="py-3.5 px-4">Tên Truyện</th>
                  <th className="py-3.5 px-4">Tác giả</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center">Thống kê</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {comics.map((comic) => (
                  <tr key={comic.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={getImageUrl(comic.coverImage)}
                        alt={comic.title}
                        className="w-10 h-14 object-cover rounded-lg border border-slate-200 bg-slate-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200&auto=format&fit=crop';
                        }}
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <Link to={`/comic/${comic.slug}`} className="hover:text-indigo-600">
                        {comic.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {comic.author || 'Chưa rõ'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={comic.status} />
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" /> {comic.viewCount || 0}
                        </span>
                        <span className="flex items-center gap-1 text-rose-500 font-semibold">
                          <Heart className="w-3.5 h-3.5 fill-rose-500" /> {comic.likeCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/comic/${comic.slug}`}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs transition-colors"
                        >
                          Quản lý Chương
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(comic)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Sửa truyện"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComic(comic.id, comic.title)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa truyện"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Comic Modal */}
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
