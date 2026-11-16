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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-[#141721] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-white/10 space-y-5 max-h-[90vh] overflow-y-auto text-left">
        
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {initialData ? 'Chỉnh Sửa Bộ Truyện' : 'Thêm Bộ Truyện Mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Tên truyện <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Solo Leveling, One Piece..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#090a0f] border border-white/10 rounded-xl focus:border-orange-500/50 text-white placeholder-zinc-600 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Tác giả
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Tên tác giả..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#090a0f] border border-white/10 rounded-xl focus:border-orange-500/50 text-white placeholder-zinc-600 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ComicStatus)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#090a0f] border border-white/10 rounded-xl focus:border-orange-500/50 text-white focus:outline-none transition-all"
              >
                <option value="ONGOING">Đang tiến hành (ONGOING)</option>
                <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                <option value="PAUSED">Tạm ngưng (PAUSED)</option>
                <option value="CANCELLED">Đã hủy (CANCELLED)</option>
              </select>
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-300">
                Thể loại ({selectedGenreIds.length} đã chọn)
              </label>
              <div className="relative w-40">
                <input
                  type="text"
                  placeholder="Lọc thể loại..."
                  value={genreFilterText}
                  onChange={(e) => setGenreFilterText(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-[11px] bg-[#090a0f] border border-white/10 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50"
                />
                <Search className="w-3 h-3 text-zinc-500 absolute left-2 top-2" />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[#090a0f] border border-white/5 rounded-xl">
              {filteredAvailableGenres.map((g) => {
                const isChecked = selectedGenreIds.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleToggleGenre(g.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-orange-500 text-white font-bold shadow-xs'
                        : 'bg-[#141721] text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Mô tả nội dung
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tóm tắt cốt truyện hấp dẫn..."
              className="w-full p-3 text-xs sm:text-sm bg-[#090a0f] border border-white/10 rounded-xl focus:border-orange-500/50 text-white placeholder-zinc-600 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Ảnh bìa Poster (3:4)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 aspect-[3/4] bg-[#090a0f] rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-zinc-600" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#090a0f] hover:bg-white/5 text-zinc-200 border border-white/10 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-orange-400" />
                  <span>{previewUrl ? 'Đổi ảnh bìa' : 'Tải lên ảnh bìa'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-zinc-500">
                  Hệ thống tự động tối ưu hóa sang WebP 80% (tối đa 1200x1600).
                </p>
                {isCompressing && (
                  <p className="text-[10px] text-orange-400 font-semibold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Đang xử lý WebP...
                  </p>
                )}
                {fileStats && (
                  <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã nén: {fileStats.origSize} ➔ {fileStats.compSize}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-[#090a0f] hover:bg-white/5 rounded-xl border border-white/5 transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="px-5 py-2 text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Đang lưu...' : initialData ? 'Cập Nhật Truyện' : 'Tạo Truyện Mới'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
