import React, { useState, useEffect } from 'react';
import type { ComicResponse, ComicStatus, ComicRequestData, GenreResponse } from '../types';
import { X, Upload, Image as ImageIcon, Loader2, CheckCircle2, Search } from 'lucide-react';
import { getImageUrl } from '../services/apiClient';
import { genreService } from '../services/genreService';
import { compressImage, formatFileSize } from '../utils/imageCompressor';

interface ComicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ComicRequestData, coverFile: File | null) => Promise<void>;
  initialData?: ComicResponse | null;
}

export const ComicModal: React.FC<ComicModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<ComicStatus>('ONGOING');
  const [description, setDescription] = useState('');
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [availableGenres, setAvailableGenres] = useState<GenreResponse[]>([]);
  const [genreFilterText, setGenreFilterText] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [fileStats, setFileStats] = useState<{ origSize: string; compSize: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadGenres();
    }
  }, [isOpen]);

  const loadGenres = async () => {
    try {
      const genres = await genreService.getAllGenres();
      setAvailableGenres(genres || []);
    } catch (err) {
      console.error('Không thể tải danh sách thể loại:', err);
    }
  };

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAuthor(initialData.author || '');
      setStatus(initialData.status || 'ONGOING');
      setDescription(initialData.description || '');
      setSelectedGenreIds(initialData.genres?.map((g) => g.id) || []);
      setPreviewUrl(initialData.coverImage ? getImageUrl(initialData.coverImage) : null);
      setCoverFile(null);
      setFileStats(null);
    } else {
      setTitle('');
      setAuthor('');
      setStatus('ONGOING');
      setDescription('');
      setSelectedGenreIds([]);
      setPreviewUrl(null);
      setCoverFile(null);
      setFileStats(null);
    }
    setGenreFilterText('');
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleToggleGenre = (id: number) => {
    setSelectedGenreIds((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      try {
        setIsCompressing(true);
        setErrorMsg('');
        // Tự động resize (max 1200x1600) & nén quality 80% sang WebP ngay trên trình duyệt người dùng
        const compressed = await compressImage(originalFile, {
          maxWidth: 1200,
          maxHeight: 1600,
          quality: 0.8,
          outputType: 'image/webp',
        });
        setCoverFile(compressed);
        setPreviewUrl(URL.createObjectURL(compressed));
        setFileStats({
          origSize: formatFileSize(originalFile.size),
          compSize: formatFileSize(compressed.size),
        });
      } catch (err) {
        console.error('Lỗi khi nén ảnh:', err);
        setCoverFile(originalFile);
        setPreviewUrl(URL.createObjectURL(originalFile));
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên truyện');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSubmit(
        {
          title,
          author,
          status,
          description,
          genreIds: selectedGenreIds,
        },
        coverFile
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu thông tin truyện');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAvailableGenres = availableGenres.filter((g) =>
    g.name.toLowerCase().includes(genreFilterText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? 'Chỉnh Sửa Truyện' : 'Thêm Truyện Mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên truyện <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: One Piece, Solo Leveling..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white text-slate-800 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tác giả
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Tên tác giả..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white text-slate-800 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ComicStatus)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white text-slate-800 focus:outline-none transition-all"
              >
                <option value="ONGOING">Đang tiến hành</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="PAUSED">Tạm ngưng</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Genres Multi-select section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Thể loại truyện ({selectedGenreIds.length} đã chọn)
              </label>
              {availableGenres.length > 10 && (
                <div className="relative w-40">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={genreFilterText}
                    onChange={(e) => setGenreFilterText(e.target.value)}
                    placeholder="Tìm thể loại..."
                    className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-40 overflow-y-auto flex flex-wrap gap-1.5 scrollbar-thin">
              {filteredAvailableGenres.map((g) => {
                const isChecked = selectedGenreIds.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleToggleGenre(g.id)}
                    title={g.description || g.name}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isChecked
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200/80 hover:border-indigo-200 hover:text-indigo-600'
                    }`}
                  >
                    {isChecked ? '✓ ' : ''}{g.name}
                  </button>
                );
              })}
              {filteredAvailableGenres.length === 0 && (
                <span className="text-xs text-slate-400 italic py-1">
                  Không tìm thấy thể loại phù hợp.
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả truyện
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu vắn tắt nội dung truyện..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white text-slate-800 focus:outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ảnh bìa truyện {initialData ? '(Tùy chọn tải ảnh mới)' : '*'}
            </label>

            <div className="flex gap-4 items-start">
              {previewUrl ? (
                <div className="relative w-24 h-32 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                  <img src={previewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-32 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-slate-50 shrink-0">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">Chưa chọn ảnh</span>
                </div>
              )}

              <div className="flex-1 space-y-2">
                <label className={`cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 ${isCompressing ? 'bg-slate-100 text-slate-400 cursor-wait' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'} text-xs font-semibold rounded-xl transition-colors border border-indigo-200/60`}>
                  {isCompressing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{isCompressing ? 'Đang nén ảnh (80%)...' : 'Chọn Tệp Ảnh Bìa'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isCompressing}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {fileStats && !isCompressing && (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Đã nén (quality 80%): <strong>{fileStats.origSize}</strong> ➔ <strong>{fileStats.compSize}</strong></span>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 leading-tight">
                  Tự động tối ưu dung lượng & resize trên trình duyệt (giúp không tốn CPU/RAM server).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm shadow-indigo-200 transition-all"
            >
              {isSubmitting ? 'Đang lưu...' : initialData ? 'Cập Nhật Truyện' : 'Tạo Truyện Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
