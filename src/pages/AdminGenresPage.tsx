import React, { useState, useEffect } from 'react';
import type { GenreResponse, GenreRequestData } from '../types';
import { genreService } from '../services/genreService';
import { Layers, Plus, Edit2, Trash2, Search, Loader2, X, BookOpen } from 'lucide-react';

export const AdminGenresPage: React.FC = () => {
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<GenreResponse | null>(null);
  const [formData, setFormData] = useState<GenreRequestData>({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await genreService.getAllGenres();
      setGenres(data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách thể loại');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingGenre(null);
    setFormData({ name: '', description: '' });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (genre: GenreResponse) => {
    setEditingGenre(genre);
    setFormData({ name: genre.name, description: genre.description || '' });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Vui lòng nhập tên thể loại');
      return;
    }

    try {
      setSubmitting(true);
      setModalError('');
      if (editingGenre) {
        const updated = await genreService.updateGenre(editingGenre.id, formData);
        setGenres((prev) => prev.map((g) => (g.id === editingGenre.id ? updated : g)));
      } else {
        const created = await genreService.createGenre(formData);
        setGenres((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Lỗi khi lưu thể loại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string, count?: number) => {
    const warning = count && count > 0 ? ` (Hiện có ${count} bộ truyện đang gán thể loại này)` : '';
    if (window.confirm(`Bạn có chắc muốn xóa thể loại "${name}"${warning}?`)) {
      try {
        await genreService.deleteGenre(id);
        setGenres((prev) => prev.filter((g) => g.id !== id));
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa thể loại');
      }
    }
  };

  const filteredGenres = genres.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="bg-[#141721] rounded-2xl p-6 border border-white/5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 tracking-tight">
            <Layers className="w-5 h-5 text-orange-400" /> Quản Lý Thể Loại Truyện
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tổng cộng <strong>{genres.length}</strong> thể loại trong hệ thống
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Thêm Thể Loại Mới
        </button>
      </div>

      {/* Search toolbar */}
      <div className="bg-[#141721] rounded-2xl p-4 border border-white/5 shadow-xl flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm thể loại theo tên, slug, mô tả..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#090a0f] text-white border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition-all placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center bg-[#141721] rounded-2xl border border-white/5">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400 mx-auto mb-2" />
          <p className="text-xs text-zinc-400">Đang tải danh sách thể loại...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-xl text-red-300 text-xs">
          {error}
        </div>
      ) : filteredGenres.length === 0 ? (
        <div className="p-12 text-center bg-[#141721] rounded-2xl border border-white/5">
          <p className="text-sm font-bold text-white">Không tìm thấy thể loại nào</p>
          <p className="text-xs text-zinc-400 mt-1">Thử thay đổi từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="bg-[#141721] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#090a0f] border-b border-white/5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Tên Thể Loại</th>
                  <th className="py-3 px-4">Slug URL</th>
                  <th className="py-3 px-4">Mô Tả</th>
                  <th className="py-3 px-4 text-center">Số Truyện</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
                {filteredGenres.map((genre, idx) => (
                  <tr key={genre.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-zinc-500 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-white">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20 font-bold text-xs">
                        {genre.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">{genre.slug}</td>
                    <td className="py-3 px-4 text-zinc-400 max-w-xs truncate">
                      {genre.description || <span className="text-zinc-600 italic">Chưa có mô tả</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#090a0f] border border-white/5 font-bold text-zinc-300 text-[11px]">
                        <BookOpen className="w-3 h-3 text-zinc-500" />
                        {genre.comicCount || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(genre)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                          title="Sửa thể loại"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(genre.id, genre.name, genre.comicCount)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-red-950/20 transition-colors cursor-pointer"
                          title="Xóa thể loại"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-[#141721] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-base font-bold text-white tracking-tight">
                {editingGenre ? 'Chỉnh Sửa Thể Loại' : 'Thêm Thể Loại Mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 text-xs bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tên Thể Loại <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Action, Phiêu lưu, Huyền Huyễn..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#090a0f] border border-white/10 rounded-xl focus:border-orange-500/50 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Mô Tả Thể Loại
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả nội dung, đặc điểm của thể loại này..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#090a0f] border border-white/10 rounded-xl focus:border-orange-500/50 text-white outline-none resize-none placeholder-zinc-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-[#090a0f] hover:bg-white/5 rounded-xl border border-white/5 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  {submitting ? 'Đang lưu...' : editingGenre ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
